use std::option::Option::Some;
use swc_common::DUMMY_SP;
use swc_core::{
    ecma::{
        ast::{
            CallExpr, Expr, Ident, JSXAttr, JSXAttrName, JSXAttrOrSpread, JSXAttrValue,
            JSXOpeningElement, Lit, Program, Str,
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

#[derive(Debug)]
struct ReactElementInfoUniqueConfig<'a> {
    file_name_attr: &'a str,
    filename: String,
    source_filename: String,
}

impl<'a> ReactElementInfoUniqueConfig<'a> {
    fn new(source_filename: &'a Option<String>) -> Self {
        ReactElementInfoUniqueConfig {
            file_name_attr: "data-qa-file",
            filename: utils::get_file_name_without_extension(&source_filename, UNKNOWN_FILENAME),
            source_filename: source_filename
                .clone()
                .unwrap_or(UNKNOWN_SOURCE_FILENAME.to_string()),
        }
    }
}

impl VisitMut for ReactElementInfoUniqueConfig<'_> {
    fn visit_mut_jsx_opening_element(&mut self, jsx_opening_element: &mut JSXOpeningElement) {
        jsx_opening_element.visit_mut_children_with(self);

        let is_file_attr_exist = utils::find_attr_by_name(jsx_opening_element, self.file_name_attr);

        if self.source_filename != UNKNOWN_FILENAME && !is_file_attr_exist {
            jsx_opening_element
                .attrs
                .push(JSXAttrOrSpread::JSXAttr(JSXAttr {
                    name: JSXAttrName::Ident(quote_ident!(format!("{}", self.file_name_attr))),
                    value: Some(JSXAttrValue::Lit(Lit::Str(Str {
                        span: DUMMY_SP,
                        value: format!("{}", self.filename).into(),
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
                // createElement
                Expr::Ident(Ident {
                    optional: false,
                    sym,
                    ..
                }) if utils::is_create_element(sym) => {
                    *call_expr = utils::clone_call_expr_with_props_change(
                        call_expr.clone(),
                        &self.filename,
                        &self.file_name_attr.to_string(),
                    );
                }
                // React.createElement
                Expr::Member(member_expr)
                    if utils::is_react_create_element_member_expr(member_expr, true) =>
                {
                    *call_expr = utils::clone_call_expr_with_props_change(
                        call_expr.clone(),
                        &self.filename,
                        &self.file_name_attr.to_string(),
                    );
                }
                // Else: do nothing
                _ => {}
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

    program.visit_mut_with(&mut ReactElementInfoUniqueConfig::new(&source_filename));

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

        let mut changed_files_paths = vec![String::from("do_nothing.js")];
        match &source_filename {
            Some(value) => {
                if value.contains("jsx_add_changed_tag.tsx")
                    || value.contains("jsx_doesnt_add_changed_if_it_exists.tsx")
                {
                    changed_files_paths.push(value.clone());
                }
            }
            _ => (),
        };

        test_fixture(
            Syntax::Typescript(TsConfig {
                tsx: input.to_string_lossy().ends_with(".tsx"),
                ..Default::default()
            }),
            &|_metadata| as_folder(ReactElementInfoUniqueConfig::new(&source_filename)),
            &input,
            &output,
            Default::default(),
        );
    }
}
