use swc_core::plugin::{plugin_transform, proxies::TransformPluginProgramMetadata};
use swc_core::{
    common::comments::Comments,
    ecma::{
        ast::{CallExpr, Callee, Expr, ImportDecl, ImportSpecifier, Program},
        visit::{VisitMut, VisitMutWith},
    },
};

#[derive(Default)]
struct TransformVisitor<C: Comments> {
    has_create_token: bool,
    comments: C,
}

impl<C: Comments> TransformVisitor<C> {
    pub fn new(comments: C) -> Self {
        TransformVisitor {
            has_create_token: false,
            comments,
        }
    }
}

impl<C: Comments> VisitMut for TransformVisitor<C> {
    fn visit_mut_import_decl(&mut self, import: &mut ImportDecl) {
        if self.has_create_token {
            return;
        }

        let ImportDecl {
            src, specifiers, ..
        } = import;

        if src.value == *"@tramvai/core" || src.value == *"@tinkoff/dippy" {
            for specifier in specifiers {
                if let ImportSpecifier::Named(specifier) = specifier {
                    self.has_create_token = &specifier.local.sym == "createToken";
                    return;
                }
            }
        }
    }

    fn visit_mut_call_expr(&mut self, call_expr: &mut CallExpr) {
        if !self.has_create_token {
            return;
        }

        if let Callee::Expr(expr) = &mut call_expr.callee {
            if let Expr::Ident(ident) = &mut **expr {
                if &ident.sym == "createToken" {
                    self.comments.add_pure_comment(call_expr.span.lo);
                }
            }
        }
    }
}

#[plugin_transform]
pub fn create_token_pure(
    mut program: Program,
    metadata: TransformPluginProgramMetadata,
) -> Program {
    program.visit_mut_with(&mut TransformVisitor::new(metadata.comments));

    program
}

#[cfg(test)]
mod tests {
    use std::path::PathBuf;

    use swc_core::ecma::transforms::testing::test_fixture;
    use swc_core::{ecma::transforms::testing::test, testing};
    use swc_ecma_parser::{Syntax, TsSyntax};
    use swc_ecma_visit::visit_mut_pass;

    use super::*;

    #[testing::fixture("tests/__fixtures__/*.ts")]
    fn fixture_create_token_pure(input: PathBuf) {
        let output = input.with_extension("js");

        test_fixture(
            Syntax::Typescript(TsSyntax {
                tsx: input.to_string_lossy().ends_with(".tsx"),
                ..Default::default()
            }),
            &|metadata| visit_mut_pass(TransformVisitor::new(metadata.comments.clone())),
            &input,
            &output,
            Default::default(),
        );
    }
}
