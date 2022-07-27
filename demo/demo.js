import { Mapper, SqlJsMapBackend } from "./mapper/mapper.js";

const map = new SqlJsMapBackend("./mapper/samples/sample_map.map");
map.load().then(function() {
	const mapper = new Mapper(map);
	mapper.render(document.getElementById("mapper"));
});
