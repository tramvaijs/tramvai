---
id: integrity
title: Integrity
---

## Subresource Integrity Support

You can enable support for the integrity mechanism for static assets (CSS/JS). To do this, add the following option to your configuration:

```
{
  "projects": {
    "projectName": {
      "name": "project-name",
      "integrity": true
    }
  }
}
```

Under the hood, the [webpack-subresource-integrity-plugin](https://github.com/waysact/webpack-subresource-integrity) is used to generate integrity values. You can also configure the plugin itself:

```
{
  "projects": {
    "projectName": {
      "name": "project-name",
      "integrity": {
        "hashFuncNames": ["sha384"],
        "enabled": "auto",
        "hashLoading": "lazy"
      }
    }
  }
}
```

## How It Works

During the build, the plugin generates an integrity hash for each compiled asset and adds it to the `stats.json` file. At runtime, the server extracts the integrity value for each asset from `stats.json` when injecting assets into the HTML and adds the `integrity` attribute.

## Details and Limitations

Note that the integrity values are also added to the client bundle. This is necessary so that Webpack’s runtime can load dynamic scripts via JSONP using integrity as well. If you have many asynchronous chunks, this can lead to a significant increase in the size of the synchronous chunk.

In such cases, the only viable solution is to reduce the number of asynchronous chunks.

Also, integrity does **not** work in a few cases:

- It doesn't work with child apps / module federation
- It doesn't account for `runtimeChunk: single`, which can lead to invalidation of the synchronous chunk in almost every build
