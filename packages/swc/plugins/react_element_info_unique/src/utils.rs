use std::path::Path;
use swc_common::DUMMY_SP;
use swc_core::ecma::ast::{
    CallExpr, Callee, Expr, ExprOrSpread, Ident, JSXAttr, JSXAttrName,
    JSXAttrOrSpread, JSXOpeningElement, MemberExpr, MemberProp, ObjectLit, PropOrSpread, Prop, KeyValueProp, PropName, Lit, Str,
};

const CREATE_ELEMENT: &str = "createElement";
const REACT_OBJECT_NAME: &str = "React";

pub fn get_file_name_without_extension(filename: &Option<String>, default: &str) -> String {
    let filename_with_extension = filename.clone().unwrap_or(default.to_string());
    return Path::new(&filename_with_extension)
        .file_stem()
        .unwrap()
        .to_str()
        .unwrap()
        .to_string();
}

pub fn is_create_element(str: &str) -> bool {
    str == CREATE_ELEMENT
}

fn is_react(str: &str) -> bool {
    str == REACT_OBJECT_NAME
}

pub fn is_react_create_element_member_expr(
    member_expr: &MemberExpr,
    check_create_element: bool,
) -> bool {
    if let Some(prop_ident) = member_expr.prop.as_ident() {
        if check_create_element && prop_ident.sym != CREATE_ELEMENT {
            return false;
        }

        if let Some(obj_ident) = member_expr.obj.as_ident() {
            return is_react(&obj_ident.sym);
        } else if let Some(inner_member_expr) = member_expr.obj.as_member() {
            return is_react_create_element_member_expr(inner_member_expr, false);
        }
    }
    false
}

pub fn create_obj_assign(first_expr: &Expr, second_expr: &Expr) -> CallExpr {
    CallExpr {
        callee: Callee::Expr(Box::new(Expr::Member(MemberExpr {
            obj: Box::new(Expr::Ident(Ident::new("Object".into(), DUMMY_SP))),
            prop: MemberProp::Ident(Ident {
                span: DUMMY_SP,
                sym: "assign".into(),
                optional: false,
            }),
            span: DUMMY_SP,
        }))),
        span: DUMMY_SP,
        args: vec![
            ExprOrSpread {
                spread: None,
                expr: Box::new(first_expr.clone()),
            },
            ExprOrSpread {
                spread: None,
                expr: Box::new(second_expr.clone()),
            },
        ],
        type_args: None,
    }
}

pub fn find_attr_by_name(jsx_opening_element: &mut JSXOpeningElement, attr_name: &str) -> bool {
    jsx_opening_element.attrs.iter().any(|attr_or_spread| {
        if let JSXAttrOrSpread::JSXAttr(JSXAttr { name, .. }) = &attr_or_spread {
            if let JSXAttrName::Ident(Ident { sym, .. }) = name {
                return sym.as_str() == attr_name;
            } else {
                return false;
            }
        } else {
            false
        }
    })
}

pub fn get_data_file_attr_as_expr(filename: &String, file_name_attr: &String) -> Expr {
    Expr::Object(ObjectLit {
        span: DUMMY_SP,
        props: vec![PropOrSpread::Prop(Box::new(Prop::KeyValue(KeyValueProp {
            key: PropName::Str(file_name_attr.clone().into()),
            value: Box::new(Expr::Lit(Lit::Str(Str {
                value: filename.clone().into(),
                span: DUMMY_SP,
                raw: None,
            }))),
        })))],
    })
}

pub fn clone_call_expr_with_props_change(orig_call_expr: CallExpr, filename: &String, file_name_attr: &String) -> CallExpr {
    let mut new_args = orig_call_expr.args.clone();

    if let Some(ExprOrSpread { expr, spread }) = new_args.get(1) {
        if spread.is_none() {
            new_args[1] = ExprOrSpread {
                spread: spread.clone(),
                expr: Box::new(Expr::Call(create_obj_assign(
                    &get_data_file_attr_as_expr(filename, file_name_attr), // Goes first to be able to override it by user
                    expr,
                ))),
            }
        }
    } else {
        new_args.push(ExprOrSpread {
            spread: None,
            expr: Box::new(Expr::Call(create_obj_assign(
                &Expr::Object(ObjectLit {
                    span: DUMMY_SP,
                    props: vec![],
                }),
                &get_data_file_attr_as_expr(filename, file_name_attr),
            ))),
        });
    }

    CallExpr {
        callee: orig_call_expr.callee,
        args: new_args,
        span: orig_call_expr.span,
        type_args: orig_call_expr.type_args,
    }
}