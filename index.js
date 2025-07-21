import { readFile } from "fs/promises";
import path from "path";
import { minify as minifyCss } from "csso";
import { minify as minifyJs } from "terser";

const HTML_TAG_PATTERN = /<([A-z0-9-]+)\s+([^>]*?)(?:src|href)\s*=\s*"([^>]*?)"([^>]*?)\s*((\/>)|(>\s*<\/\s*\1\s*>))/gi;
const DEFAULT_OPTIONS = {
  optimizeCss: true,
  optimizeJs: true,
  cssoOptions: {},
  terserOptions: {},
  replaceTags: [],
  inlineServer: false // 控制在开发服务器模式下是否内联资源
};


function VitePluginInlineSource(opts = {}) {
  const options = { ...DEFAULT_OPTIONS, ...opts };
  let root = "";
  let isDevServer = false;

  async function transformHtml(source, ctx) {
    if (isDevServer && !options.inlineServer) {
      return source;
    }
    const result = [];
    const tokens = source.matchAll(HTML_TAG_PATTERN);
    let prevPos = 0;

    for (const token of tokens) {
      const [matched, tagName, preAttributes, fileName, postAttributes] = token;
      const { index } = token;

      const shouldInline = /\binline-source\b/.test(
        preAttributes + " " + postAttributes
      );
      if (!shouldInline) continue;

      const fileExt = path.extname(fileName).toLowerCase();
      const isCssFile = fileExt === ".css";
      const isJsFile = fileExt === ".js";

      try {
        let fileContent = await getFileContent(fileName, ctx);

        fileContent = await optimizeContent(fileContent, isCssFile, isJsFile, options);

        fileContent = fileContent.replace(/^<!DOCTYPE(.*?[^?])?>/, "");

        if (index !== prevPos) {
          result.push(source.slice(prevPos, index));
        }

        result.push(generateInlineContent(tagName, preAttributes, postAttributes, fileContent, options));

        prevPos = index + matched.length;
      } catch (error) {
        console.error(`Error inlining ${fileName}:`, error.message);
        // 内联失败时，保留原始标签
        if (index !== prevPos) {
          result.push(source.slice(prevPos, index + matched.length));
        }
        prevPos = index + matched.length;
      }
    }

    result.push(source.slice(prevPos));
    return result.join("");
  }


  async function getFileContent(filePath, ctx) {
    if (ctx.server) {
      try {
        let resolvedPath = filePath;
        if (filePath.startsWith('/')) {
          resolvedPath = path.join(root, filePath.substring(1));
        } else if (!path.isAbsolute(filePath)) {
          resolvedPath = path.join(root, filePath);
        }

        return (await readFile(resolvedPath)).toString();
      } catch (error) {
        console.error(`Failed to read file ${filePath}:`, error);
        throw error;
      }
    } else {
      const realPath = root ? path.join(root, filePath) : filePath;
      const loaded = await ctx.load({ id: `${realPath}?raw` });
      return loaded?.ast?.body?.[0]?.declaration?.value || '';
    }
  }

  async function optimizeContent(content, isCssFile, isJsFile, options) {
    if (isCssFile && options.optimizeCss) {
      const minifiedCode = minifyCss(content, options.cssoOptions).css;
      if (minifiedCode.length === 0 && content.length !== 0) {
        throw new Error("Failed to minify CSS");
      }
      return minifiedCode;
    } else if (isJsFile && options.optimizeJs) {
      const result = await minifyJs(content, options.terserOptions);
      return result?.code || content;
    }
    return content;
  }


  function generateInlineContent(tagName, preAttributes, postAttributes, content, options) {
    const cleanedPreAttrs = preAttributes.replace(/inline-source/g, "").trim();
    const cleanedPostAttrs = postAttributes.replace(/inline-source/g, "").trim();
    const attrs = [cleanedPreAttrs, cleanedPostAttrs].filter(Boolean).join(" ");

    if (options.replaceTags.includes(tagName)) {
      return content.replace(
        new RegExp(`^<\\s*${tagName}`),
        `<${tagName} ${attrs}`
      );
    } else if (tagName.toLowerCase() === 'link') {
      return `<style ${attrs}>${content}</style>`;
    } else {
      return `<${tagName} ${attrs}>${content}</${tagName}>`;
    }
  }

  return {
    name: "vite-plugin-inline-source-minus",
    configResolved(_config) {
      root = _config.root ?? "";
      isDevServer = _config.command === 'serve';

      if (isDevServer && options.inlineServer) {
        if (!_config.__htmlTransforms) {
          _config.__htmlTransforms = [];
        }
        _config.__htmlTransforms.push({
          name: 'inline-source',
          transform: async (html, ctx) => {
            return transformHtml(html, ctx);
          }
        });

      console.log('Registered transform function in config', 'CONFIG_REGISTERED');
      }
    },
    transform(source, id) {
      if (id && !id.endsWith(".html")) {
        return null;
      }
      return transformHtml(source, this);
    },
    transformIndexHtml(source, ctx) {
      return transformHtml(source, ctx);
    }
  };
}

export default VitePluginInlineSource;
