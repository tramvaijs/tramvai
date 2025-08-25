use std::path::Path;
use swc_common::DUMMY_SP;
use swc_core::ecma::ast::{
    CallExpr, Callee, Expr, ExprOrSpread, Ident, JSXAttr, JSXAttrName, JSXAttrOrSpread,
    JSXOpeningElement, KeyValueProp, Lit, MemberExpr, MemberProp, ObjectLit, Prop, PropName,
    PropOrSpread, Str,
};

const CREATE_ELEMENT: &str = "createElement";
const REACT_OBJECT_NAME: &str = "React";
const FRAGMENT: &str = "Fragment";

/// Extracts the file name without extension from a path.
///
/// # Arguments
///
/// * `filename` - Optional string containing the file path
/// * `default` - Default value to use if filename is None or invalid
///
/// # Returns
///
/// The file name without extension, or the default value if extraction fails
pub fn get_file_name_without_extension(filename: &Option<String>, default: &str) -> String {
    match filename {
        None => default.to_string(),
        Some(path_str) => Path::new(path_str)
            .file_stem()
            .and_then(|stem| stem.to_str())
            .map(|s| s.to_string())
            .unwrap_or_else(|| default.to_string()),
    }
}

fn is_react(str: &str) -> bool {
    str == REACT_OBJECT_NAME
}

fn create_prop(filename: &str, file_name_attr: &str) -> swc_core::ecma::ast::PropOrSpread {
    return PropOrSpread::Prop(Box::new(Prop::KeyValue(KeyValueProp {
        key: PropName::Str(file_name_attr.into()),
        value: Box::new(Expr::Lit(Lit::Str(Str {
            value: filename.into(),
            span: DUMMY_SP,
            raw: None,
        }))),
    })));
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

pub fn get_data_file_attr_as_expr(filename: &str, file_name_attr: &str) -> Expr {
    Expr::Object(ObjectLit {
        span: DUMMY_SP,
        props: vec![create_prop(filename, file_name_attr)],
    })
}

pub fn clone_call_expr_with_props_change(
    orig_call_expr: CallExpr,
    filename: &str,
    file_name_attr: &str,
) -> CallExpr {
    let mut new_args = orig_call_expr.args.clone();

    // Case 1: There's only one argument (element type), add a new props object
    if new_args.len() == 1 {
        new_args.push(ExprOrSpread {
            spread: None,
            expr: Box::new(get_data_file_attr_as_expr(filename, file_name_attr)),
        });
    }
    // Case 2: There's a second argument (props)
    else if let Some(ExprOrSpread { expr, spread: None }) = new_args.get_mut(1) {
        // Case 2.1: Props is null, replace with a new object
        if let Expr::Lit(Lit::Null(..)) = expr.as_mut() {
            *expr = Box::new(get_data_file_attr_as_expr(filename, file_name_attr));
        }
        // Case 2.2: Props is an object literal, add property directly
        else if let Expr::Object(obj_lit) = expr.as_mut() {
            obj_lit
                .props
                .push(create_prop(filename, file_name_attr));
        }
        // Case 2.3: Props is some other expression (variable, etc.), use Object.assign
        else {
            new_args[1] = ExprOrSpread {
                spread: None,
                expr: Box::new(Expr::Call(create_obj_assign(
                    &get_data_file_attr_as_expr(filename, file_name_attr),
                    expr,
                ))),
            };
        }
    }

    CallExpr {
        callee: orig_call_expr.callee,
        args: new_args,
        span: orig_call_expr.span,
        type_args: orig_call_expr.type_args,
    }
}

/// Checks if the JSX element is a Fragment
/// Handles both <></> (empty tag name) and <Fragment> or <React.Fragment>
pub fn is_fragment(jsx_opening_element: &JSXOpeningElement) -> bool {
    // Handle special case for empty tag name (short fragment syntax)
    let is_empty_tag = match &jsx_opening_element.name {
        swc_core::ecma::ast::JSXElementName::Ident(ident) => ident.sym.is_empty(),
        _ => false,
    };

    if is_empty_tag {
        return true; // Empty tag name indicates fragment like <></>
    }

    match &jsx_opening_element.name {
        // Check for <Fragment>
        swc_core::ecma::ast::JSXElementName::Ident(ident) => ident.sym == FRAGMENT,
        // Check for <React.Fragment>
        swc_core::ecma::ast::JSXElementName::JSXMemberExpr(jsx_member_expr) => {
            if let swc_core::ecma::ast::JSXObject::Ident(obj) = &jsx_member_expr.obj {
                return obj.sym == REACT_OBJECT_NAME && jsx_member_expr.prop.sym == FRAGMENT;
            }
            false
        }
        // JSXNamespacedName is not a fragment
        swc_core::ecma::ast::JSXElementName::JSXNamespacedName(_) => false,
    }
}

/// Checks if the expression is React.Fragment
pub fn is_fragment_expr(expr: &Expr) -> bool {
    match expr {
        // Check for Fragment identifier
        Expr::Ident(ident) => ident.sym == FRAGMENT,

        // Check for React.Fragment
        Expr::Member(member_expr) => {
            if let Some(prop_ident) = member_expr.prop.as_ident() {
                if prop_ident.sym != FRAGMENT {
                    return false;
                }

                if let Some(obj_ident) = member_expr.obj.as_ident() {
                    return is_react(&obj_ident.sym);
                }
            }
            false
        }
        _ => false,
    }
}
