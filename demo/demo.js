import { Mapper, SqlJsMapBackend } from "./mapper/mapper.js";

let renderedMap;

function loadMap(map) {
	if(renderedMap) {
		renderedMap.disconnect();
	}
	map.load().then(function() {
		const mapper = new Mapper(map);
		renderedMap = mapper.render(document.getElementById("mapper"));
		renderedMap.hooks.add("draw_help", function(options) {
			options.infoLine("Shift+N to make a blank map.");
		});

		renderedMap.registerKeyboardShortcut((context, event) => event.key === "N", async () => {
			loadMap(new SqlJsMapBackend());
		});
	});
}

loadMap(new SqlJsMapBackend("./mapper/samples/sample_map.map"));
