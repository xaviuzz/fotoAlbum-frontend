const flexokiColors = [
	"#af3029",
	"#bc5215",
	"#ad8301",
	"#66800b",
	"#24837b",
	"#205ea6",
	"#5e409d",
	"#a02f6f",
];

export function avatarColorOf(identity: string) {
	let sum = 0;
	for (const character of identity) {
		sum += character.charCodeAt(0);
	}
	const position = sum % flexokiColors.length;
	return flexokiColors[position];
}
