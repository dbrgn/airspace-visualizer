#![deny(clippy::all)]
#![warn(clippy::pedantic)]
#![allow(clippy::non_ascii_literal, clippy::single_match_else, clippy::if_not_else,
         clippy::similar_names, clippy::module_name_repetitions)]

#[macro_use] extern crate log;

mod utils;

use std::mem;
use std::io::Cursor;

use js_sys::Uint8Array;
use openair::parse;
use wasm_bindgen::prelude::*;

/// Parse the file contents, return the list of airspaces or null (if parsing
/// failed).
#[wasm_bindgen]
pub fn process_openair(data: Uint8Array) -> JsValue {
    utils::set_panic_hook();
    utils::init_log();

    // Copy data from JS into WASM memory
    let mut bytes = vec![0u8; data.byte_length() as usize];
    data.copy_to(&mut bytes);
    mem::drop(data);

    // Process data
    info!("process_openair ({} bytes)", bytes.len());
    let mut cursor = Cursor::new(&bytes);
    let airspaces = match parse(&mut cursor) {
        Ok(parsed) => parsed,
        Err(e) => {
            error!("Could not parse airspace data: {}", e);
            return JsValue::NULL;
        }
    };

    // Serialize and return data
    match JsValue::from_serde(&airspaces) {
        Ok(val) => val,
        Err(e) => {
            error!("Could not serialize airspaces: {}", e);
            JsValue::NULL
        },
    }
}


#[cfg(test)]
mod tests {
    use wasm_bindgen_test::*;

    wasm_bindgen_test_configure!(run_in_browser);
}
