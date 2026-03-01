/**
 * Custom register hook for SWC dev runner.
 * Patches Module._resolveFilename to remap .js -> .ts (required by
 * moduleResolution: nodenext — TypeScript source imports use .js extensions).
 */
const Module = require("node:module");

const _originalResolve = Module._resolveFilename.bind(Module);

Module._resolveFilename = function (request, parent, isMain, options) {
  try {
    return _originalResolve(request, parent, isMain, options);
  } catch (err) {
    if (typeof request === "string" && request.endsWith(".js")) {
      try {
        return _originalResolve(
          `${request.slice(0, -3)}.ts`,
          parent,
          isMain,
          options,
        );
      } catch {
        // fall through to original error
      }
    }
    throw err;
  }
};

require("@swc-node/register");
