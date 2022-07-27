import { Mapper, SqlJsMapBackend } from "./mapper.js";

const map = new SqlJsMapBackend("./samples/sample_map.map");
map.load().then(function() {
	const mapper = new Mapper(map);
	mapper.render(document.getElementById("mapper"));
});
