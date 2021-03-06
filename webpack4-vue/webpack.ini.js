const { NODE_ENV, PKG_CSS, DIR_SVC, IE_SHIM } = process.env;
const path = require("path");
const pkg = require("./package.json");
const isProd = NODE_ENV === "production";
const ver = isProd ? ".[hash:5]" : "-" + pkg.version;
const min = isProd ? ".min" : "";
const ts = Date.now();
const rel = path.relative.bind(path);
const dir = path.join.bind(path, __dirname);
const dst = array => array ? [...new Set(array)] : [];
const fmt = (f, app) => f instanceof Function ? f(app) : f;

// 可用 https://jsdelivr.com 去搜索 npm 模块文件和路径
const elecdn = "https://npm.elemecdn.com/";
const cdnyun = "https://cdnjs.cloudflare.com/ajax/libs/";
// 路径常量请尽可能以`/`结尾 webpackConfig.output.publicPath
const publicPath = undefined;
const prefixAjax = undefined;
const buildFolder = "build";
const outputFolder = "dist";
const staticFolder = "src/static";
const templateFolder = "src/views";

// https://github.com/webpack-contrib/style-loader#options
const styleLoader = {
	loader: "style-loader",
	options: { sourceMap: !isProd },
};
// https://github.com/webpack-contrib/css-loader#options
const cssStyleLoader = {
	loader: "css-loader",
	options: {
		url: false,
		modules: false,
		minimize: isProd,
		sourceMap: !isProd,
	},
};
const cssModuleLoader = {
	loader: "css-loader",
	options: {
		url: false,
		modules: true,
		minimize: isProd,
		sourceMap: !isProd,
		localIdentName: "[name]_[local]_[hash:base64:5]",
	},
};
// https://github.com/webpack-contrib/sass-loader
const scssStyleLoader = {
	loader: "sass-loader",
	options: {
		minimize: isProd,
		sourceMap: !isProd,
	},
};
// npm i -D node-sass sass-loader 易出错可配镜像后卸载再试
// loader 在调用的时候才会去执行,因此不安装不调用是不会出错的
// https://github.com/webpack-contrib/less-loader
const lessStyleLoader = {
	loader: "less-loader",
	options: {
		minimize: isProd,
		sourceMap: !isProd,
		relativeUrls: false,
		javascriptEnabled: true,
		modifyVars: {
			"@icon-url": JSON.stringify("../antd/antd"),
			"@primary-color": "#409eff",
			"@menu-dark-bg": "#404040",
			"@menu-highlight-color": "#39c6cd",
			"@menu-dark-item-active-bg": "#39c6cd",
			"@menu-dark-item-selected-bg": "#39c6cd",
		},
	},
};
// https://github.com/ant-design/ant-design/blob/master/components/style/themes/default.less
const dps = Object.assign(
	{}, pkg.dependencies,
	pkg.devDependencies
);
if ("vue-loader" in dps) {
	// https://github.com/vuejs/vue-style-loader
	styleLoader.loader = "vue-style-loader";
}
const c = key => parseFloat(
	String(dps[key]).replace(/[^.\d]+/g, "")
);

/* Prod Asset      Size  Chunks        Chunk Names
common.dll.js  77.4 KiB       0  [emitted]  common
public.dll.js  87.3 KiB       1  [emitted]  public
vendor.dll.js  97.2 KiB       2  [emitted]  vendor */
const polyfill = ["babel-polyfill"];
// ie8 在引入 babel-polyfill 前必须先引入 es5-shim
c("babel-loader") >= 8 &&
	polyfill.splice(0, 1, "@babel/polyfill");
// ie9 支持 react16 必须引入 raf/polyfill
c("react") >= 16 && polyfill.push("raf/polyfill");
// ie9 支持 antd 必须引入 media-match
("antd" in dps) && polyfill.push("media-match");
const entry = {
	page: [""],
	rel, dir, dst, fmt, c,
	publicPath, prefixAjax,
	buildFolder, outputFolder,
	staticFolder, templateFolder,
	cssStyleLoader, cssModuleLoader,
	scssStyleLoader, lessStyleLoader,
	isProd, ver, min, ts, styleLoader,
	dll: {
		common: polyfill,
		public: [
			"axios",
			"moment",
			"numeral",
			"signals",
			"js-cookie",
			"nprogress",
			"pubsub-js",
			"moment/locale/zh-cn",
		],
		vendor: [
			"vue",
			"vuex",
			"vue-router",
		],
	},
	/* lib: {
		jquery: ["jquery", "jquery-ui"]
			.map(v => `./js/${v}.min`),
		ie8: ["es5-shim", "es5-sham", "html5shiv",
			"selectivizr", "nwmatcher", "respond"]
			.map(v => `./ie8/${v}.min`),
	}, */
	ipt: {
		public: [...polyfill, dir("src/utils/public.js")]
			.slice(isProd || IE_SHIM ? 0 : -1),
	},
	cdn: {
		jquery: "$",
		wangeditor: "wangEditor",
	},
	html: {
		title: "",
		ico: `favicon.ico`,
		js: [
			`js/jquery.min.js`,
			`js/jquery-ui.min.js`,
			`editor/wangeditor.min.js`,
			!`js/pace.min.js`,
			!`js/fastclick.min.js`,
			!`js/wangeditor.min.js`,
		],
		css: [
			`css/normalize-ie8.min.css`,
			`editor/wangeditor.min.css`,
			`fa/fa-4.x.min.css`,
			`${elecdn}element-ui@2.4.8/lib/theme-chalk/index.css`,
			// highlight.js
			!`${cdnyun}highlight.js/9.12.0/styles/atom-one-light.min.css`,
			!`${cdnyun}highlight.js/9.12.0/styles/atom-one-dark.min.css`,
			!`${cdnyun}highlight.js/9.12.0/highlight.min.js`,
			// vant
			!`${elecdn}vant@1.3.4/lib/vant-css/index.css`,
			!`${elecdn}vant@1.3.4/lib/vant.min.js`,
		],
		// https://webpack.docschina.org/configuration/dev-server
		// https://github.com/chimurai/http-proxy-middleware#options
		proxy: {
			"/proxy": {
				target: "https://proxy.io",
				changeOrigin: true,
				secure: true,
				pathRewrite: { "^/proxy": "" },
				bypass: (req, res, proxyOptions) => {
					if (/\.html/.test(req.url)) {
						return req.originalUrl;
					}
				},
				onProxyReq: (proxyReq, req, res) => {
					proxyReq.setHeader("x-auth-token", "forever");
				},
				onProxyRes: (proxyRes, req, res) => {
					proxyRes.setHeader("location", "/login.html");
				},
			},
		},
	},
};

if (isProd) {
	if (PKG_CSS/* 纯打包编译样式文件 */) {
		entry.ipt = { style: "@/" + PKG_CSS };
		delete entry.page;
		delete entry.dll;
	}
} else if (DIR_SVC/* 使用静态文件服务器 */) {
	// 生产包做静态服务器
	entry.staticFolder = outputFolder;
	entry.ipt = { u: "@/utils/fns" };
	delete entry.page;
	delete entry.dll;
} else if (IE_SHIM/* 兼容 IE 浏览器 */) {
	entry.ie = true;
}
entry.html.chunks = Object.keys(entry.ipt || {});
module.exports = entry;