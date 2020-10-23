<p align="center">
  <a href="https://github.com/jetli/wasm-bindgen-action/actions"><img alt="wasm-bindgen-action status" src="https://github.com/jetli/wasm-bindgen-action/workflows/build-test/badge.svg"></a>
</p>

# `wasm-bindgen-action`

Install `wasm-bindgen` by downloading the executable (much faster than `cargo install wasm-bindgen-cli`, seconds vs minutes).

## Usage

```yaml
- uses: jetli/wasm-bindgen-action@v0.1.0
  with:
    # Optional version of wasm-bindgen to install(eg. '0.2.68', 'latest')
    version: 'latest'
```

## Resources
- https://github.com/rustwasm/wasm-bindgen
