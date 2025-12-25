use std::mem;

use if_chain::if_chain;
use swc_common::DUMMY_SP;
use swc_core::ecma::utils::{prepend_stmt, private_ident, StmtLike, StmtOrModuleItem};
use swc_core::ecma::{
    ast::*,
    visit::{VisitMut, VisitMutWith},
};
use swc_core::plugin::{plugin_transform, proxies::TransformPluginProgramMetadata};
use swc_core::quote;

#[derive(Default)]
pub struct TransformVisitor {
    ref_list: Vec<Ident>,
}

impl TransformVisitor {
    pub fn new() -> Self {
        Default::default()
    }
}

impl VisitMut for TransformVisitor {
    fn visit_mut_expr(&mut self, expr: &mut Expr) {
        expr.visit_mut_children_with(self);

        if let Expr::Object(i) = expr {
            let mut has_provide_key = false;
            let mut has_use_key = false;

            for prop_or_spread in i.props.iter() {
                if_chain! {
                    if let PropOrSpread::Prop(prop) = prop_or_spread;
                    if let Prop::KeyValue(key_value) = &**prop;
                    if let PropName::Ident(key) = &key_value.key;
                    then {
                        let value: &str = &key.sym;

                        match value {
                            "useValue" | "useFactory" | "useClass" => { has_use_key = true },
                            "provide" => { has_provide_key = true },
                            _ => {},
                        }
                    }
                }
            }

            if has_provide_key && has_use_key {
                let uniq_ref = private_ident!("_ref");
                self.ref_list.push(uniq_ref.clone());

                *expr = quote!(
                    "($ref_name = $provider_value,
                     Object.defineProperty($ref_name, '__stack', {
                        enumerable: false,
                        value: new globalThis.Error().stack,
                     }),
                     $ref_name)" as Expr,
                    ref_name: Ident = uniq_ref,
                    provider_value: Expr = expr.clone(),
                );
            }
        }
    }

    fn visit_mut_stmts(&mut self, stmts: &mut Vec<Stmt>) {
        self.visit_mut_stmt_like(stmts);
    }

    fn visit_mut_module_items(&mut self, stmts: &mut Vec<ModuleItem>) {
        self.visit_mut_stmt_like(stmts);
    }
}

impl TransformVisitor {
    fn visit_mut_stmt_like<T>(&mut self, stmts: &mut Vec<T>)
    where
        T: Send + Sync + StmtLike + StmtOrModuleItem + VisitMutWith<Self> + std::fmt::Debug,
        Vec<T>: VisitMutWith<Self>,
    {
        let prev_ref_list = mem::take(&mut self.ref_list);
        stmts.visit_mut_children_with(self);

        if !self.ref_list.is_empty() {
            let ref_list = mem::take(&mut self.ref_list);

            let ref_declaration = VarDecl {
                span: DUMMY_SP,
                kind: VarDeclKind::Var,
                declare: false,
                decls: ref_list
                    .into_iter()
                    .map(|ref_ident| VarDeclarator {
                        span: DUMMY_SP,
                        name: Pat::Ident(ref_ident.into()),
                        init: Option::None,
                        definite: false,
                    })
                    .collect(),
                ..Default::default()
            };

            prepend_stmt(
                stmts,
                T::from_stmt(Stmt::Decl(Decl::Var(Box::new(ref_declaration)))),
            );
        }

        self.ref_list = prev_ref_list;
    }
}

#[plugin_transform]

pub fn process_transform(
    mut program: Program,
    _metadata: TransformPluginProgramMetadata,
) -> Program {
    program.visit_mut_with(&mut TransformVisitor::new());

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
    fn fixture_provider_stack(input: PathBuf) {
        let output = input.with_extension("js");

        test_fixture(
            Syntax::Typescript(TsSyntax {
                tsx: input.to_string_lossy().ends_with(".tsx"),
                decorators: true,
                ..Default::default()
            }),
            &|_metadata| visit_mut_pass(TransformVisitor::new()),
            &input,
            &output,
            Default::default(),
        );
    }
}
