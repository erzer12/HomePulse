module.exports = {
	root: true,
	extends: ["expo"],
	ignorePatterns: ["node_modules/", "dist/"],
	settings: {
		"import/resolver": {
			typescript: {
				project: "./tsconfig.json",
			},
			node: {
				extensions: [".js", ".jsx", ".ts", ".tsx"],
			},
		},
	},
	rules: {
		// Disable the unresolved error for path aliases specifically if it's still being stubborn
		// but usually the settings above should fix it.
		"import/no-unresolved": ["error", { ignore: ["^@/"] }],
	},
};
