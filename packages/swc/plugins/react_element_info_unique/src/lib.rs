//! # React Element Info Unique Plugin
//!
//! This SWC plugin automatically adds source file information to React elements.
//! It works by injecting a `data-qa-file` attribute (configurable) to each JSX element
//! and to each React.createElement call with the filename of the source.
//!
//! ## Transformations:
//!
//! ### JSX Elements:
//! ```jsx
//! <div>Hello World</div>
//! ```
//! becomes:
//! ```jsx
//! <div data-qa-file="filename">Hello World</div>
//! ```
//!
//! ### React.createElement Calls:
//! ```js
//! React.createElement("div", null, "Hello World")
//! ```
//! becomes:
//! ```js
//! React.createElement("div", {"data-qa-file": "filename"}, "Hello World")
//! ```
//!
//! ## Notes:
//! - The plugin skips React Fragment elements
//! - Handles various import patterns for React and createElement
use std::option::Option::Some;
use std::collections::HashSet;
use swc_common::DUMMY_SP;
use swc_core::{
    ecma::{
        ast::{
            CallExpr, Expr, JSXAttr, JSXAttrName, JSXAttrOrSpread, JSXAttrValue,
            JSXOpeningElement, Lit, Program, Str,
            ImportDecl, ImportSpecifier, ModuleExportName,
        },
        utils::quote_ident,
        visit::{VisitMut, VisitMutWith},
    },
    plugin::{
        metadata::TransformPluginMetadataContextKind, plugin_transform,
        proxies::TransformPluginProgramMetadata,
    },
};
mod utils;

const UNKNOWN_SOURCE_FILENAME: &str = "__unknown_source_filename__";
const UNKNOWN_FILENAME: &str = "__unknown_filename__";
const REACT_PACKAGE_NAME: &str = "react";
const DEFAULT_FILE_NAME_ATTR: &str = "data-qa-file";

#[derive(Debug)]
struct ReactElementInfoUniqueConfig<'a> {
    file_name_attr: &'a str,
    filename: String,
    source_filename: String,
    react_imports: HashSet<String>,
    create_element_imports: HashSet<String>,
}

impl Default for ReactElementInfoUniqueConfig<'_> {
    fn default() -> Self {
        Self {
            file_name_attr: DEFAULT_FILE_NAME_ATTR,
            filename: UNKNOWN_FILENAME.to_string(),
            source_filename: UNKNOWN_SOURCE_FILENAME.to_string(),
            react_imports: HashSet::new(),
            create_element_imports: HashSet::new(),
        }
    }
}

impl<'a> ReactElementInfoUniqueConfig<'a> {
    fn new(source_filename: &'a Option<String>) -> Self {
        let mut config = Self::default();
        if let Some(filename) = source_filename {
            config.source_filename = filename.clone();
            config.filename = utils::get_file_name_without_extension(source_filename, UNKNOWN_FILENAME);
        }
        config
    }
}

impl VisitMut for ReactElementInfoUniqueConfig<'_> {
    /// Processes import declarations to track React and createElement imports.
    ///
    /// This method analyzes import statements to identify:
    /// 1. Default React imports (`import React from 'react'`)
    /// 2. Named createElement imports (`import { createElement } from 'react'`)
    /// 3. Namespace React imports (`import * as React from 'react'`)
    ///
    /// The collected import information is used later to identify React.createElement calls
    /// that need to be transformed with file source information.
    fn visit_mut_import_decl(&mut self, import_decl: &mut ImportDecl) {
        // Check that the import is from 'react'
        if import_decl.src.value.to_string() == REACT_PACKAGE_NAME {
            for specifier in &import_decl.specifiers {
                match specifier {
                    // Handle default import: import React from 'react'
                    ImportSpecifier::Default(default_spec) => {
                        self.react_imports.insert(default_spec.local.sym.to_string());
                    },
                    // Handle named imports: import { createElement } from 'react'
                    ImportSpecifier::Named(named_spec) => {
                        let imported_name = match &named_spec.imported {
                            Some(ModuleExportName::Ident(ident)) => ident.sym.to_string(),
                            Some(ModuleExportName::Str(str)) => str.value.to_string(),
                            None => named_spec.local.sym.to_string(),
                        };

                        let local_name = named_spec.local.sym.to_string();

                        if imported_name == "createElement" {
                            self.create_element_imports.insert(local_name);
                        }
                    },
                    // Handle namespace import: import * as React from 'react'
                    ImportSpecifier::Namespace(namespace_spec) => {
                        self.react_imports.insert(namespace_spec.local.sym.to_string());
                    },
                }
            }
        }

        // Continue traversing the AST
        import_decl.visit_mut_children_with(self);
    }

    fn visit_mut_jsx_opening_element(&mut self, jsx_opening_element: &mut JSXOpeningElement) {
        jsx_opening_element.visit_mut_children_with(self);

        let is_file_attr_exist = utils::find_attr_by_name(jsx_opening_element, self.file_name_attr);

        // Skip adding attribute to React Fragments
        if utils::is_fragment(jsx_opening_element) {
            return;
        }

        if self.source_filename != UNKNOWN_FILENAME && !is_file_attr_exist {
            jsx_opening_element
                .attrs
                .push(JSXAttrOrSpread::JSXAttr(JSXAttr {
                    name: JSXAttrName::Ident(quote_ident!(self.file_name_attr)),
                    value: Some(JSXAttrValue::Lit(Lit::Str(Str {
                        span: DUMMY_SP,
                        value: self.filename.clone().into(),
                        raw: None,
                    }))),
                    span: DUMMY_SP,
                }));
        }
    }

    fn visit_mut_call_expr(&mut self, call_expr: &mut CallExpr) {
        call_expr.visit_mut_children_with(self);

        if let Some(callee_expr) = call_expr.callee.as_expr() {
            match callee_expr.as_ref() {
                // Check if this is a call to the imported createElement
                Expr::Ident(ident) => {
                    let ident_name = ident.sym.to_string();
                    if self.create_element_imports.contains(&ident_name) {
                        // This is imported createElement from React
                        // Skip if the first argument is a Fragment
                        if let Some(first_arg) = call_expr.args.first() {
                            if utils::is_fragment_expr(&first_arg.expr) {
                                return;
                            }
                        }

                        *call_expr = utils::clone_call_expr_with_props_change(
                            call_expr.clone(),
                            &self.filename,
                            &self.file_name_attr.to_string(),
                        );
                    }
                },

                // Check React.createElement
                Expr::Member(member_expr) => {
                    if let Some(obj_ident) = member_expr.obj.as_ident() {
                        let obj_name = obj_ident.sym.to_string();
                        if self.react_imports.contains(&obj_name) {
                            if let Some(prop_ident) = member_expr.prop.as_ident() {
                                if prop_ident.sym.to_string() == "createElement" {
                                    // This is React.createElement
                                    // Skip if the first argument is a Fragment
                                    if let Some(first_arg) = call_expr.args.first() {
                                        if utils::is_fragment_expr(&first_arg.expr) {
                                            return;
                                        }
                                    }

                                    *call_expr = utils::clone_call_expr_with_props_change(
                                        call_expr.clone(),
                                        &self.filename,
                                        &self.file_name_attr.to_string(),
                                    );
                                }
                            }
                        }
                    } else if utils::is_react_create_element_member_expr(member_expr, true) {
                        // For backward compatibility, we keep the check using the utility
                        // Skip if the first argument is a Fragment
                        if let Some(first_arg) = call_expr.args.first() {
                            if utils::is_fragment_expr(&first_arg.expr) {
                                return;
                            }
                        }

                        *call_expr = utils::clone_call_expr_with_props_change(
                            call_expr.clone(),
                            &self.filename,
                            &self.file_name_attr.to_string(),
                        );
                    }
                },
                _ => {},
            }
        }
    }
}

#[plugin_transform]
pub fn react_element_info_unique(
    mut program: Program,
    metadata: TransformPluginProgramMetadata,
) -> Program {
    let source_filename = metadata.get_context(&TransformPluginMetadataContextKind::Filename);

    let mut visitor = ReactElementInfoUniqueConfig::new(&source_filename);
    program.visit_mut_with(&mut visitor);

    program
}

#[cfg(test)]
mod tests {
    use std::path::PathBuf;

    use swc_core::ecma::transforms::testing::test_fixture;
    use swc_core::{
        ecma::{transforms::testing::test, visit::as_folder},
        testing,
    };
    use swc_ecma_parser::{Syntax, TsConfig};

    use super::*;

    #[testing::fixture("tests/__fixtures__/*.tsx")]
    #[testing::fixture("tests/__fixtures__/*.ts")]
    fn fixture_react_element_info_unique(input: PathBuf) {
        let output = input.with_extension("js");

        let source_filename: Option<String> = Some(input.as_path().to_str().unwrap().to_string());

        test_fixture(
            Syntax::Typescript(TsConfig {
                tsx: input.to_string_lossy().ends_with(".tsx"),
                ..Default::default()
            }),
            &|_| {
                as_folder(ReactElementInfoUniqueConfig::new(&source_filename))
            },
            &input,
            &output,
            Default::default(),
        );
    }
}
