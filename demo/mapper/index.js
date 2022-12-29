/** A vector in 3d space. */
class Vector3 {
	constructor(x, y, z) {
		this.x = x;
		this.y = y;
		this.z = z;
	}

	toString() {
		return this.x.toString() + "," + this.y.toString() + "," + this.z.toString();
	}

	/** Construct a new vector from this vector plus another via vector addition.
	 * @param other {Vector3} another vector
	 * @returns this + other
	 */
	add(other) {
		return new Vector3(this.x + other.x, this.y + other.y, this.z + other.z);
	}

	/** Construct a new vector from this vector minus another via vector subtraction.
	 * @param other {Vector3} another vector
	 * @returns this - other
	 */
	subtract(other) {
		return new Vector3(this.x - other.x, this.y - other.y, this.z - other.z);
	}

	/**
	 * Construct a new vector from this vector multiplied by a scalar value.
	 * @param scalar
	 * @returns {Vector3}
	 */
	multiplyScalar(scalar) {
		return new Vector3(this.x * scalar, this.y * scalar, this.z * scalar);
	}

	/**
	 * Construct a new vector from this vector divided by a scalar value.
	 * @param scalar
	 * @returns {Vector3}
	 */
	divideScalar(scalar) {
		return this.multiplyScalar(1 / scalar);
	}

	/** Get the length of this vector, squared.
	 * May be used for length comparisons without needing to calculate the actual length using square root.
	 * @returns {number}
	 */
	lengthSquared() {
		return this.x * this.x + this.y * this.y + this.z * this.z;
	}

	/** Get the length of this vector.
	 * @returns {number}
	 */
	length() {
		return Math.sqrt(this.lengthSquared());
	}

	/** Construct a new normalized vector based on this one.
	 * That is, scales this vector by a scalar so that its length equals one.
	 * If the original vector's length is zero, then the normalized vector will be the zero vector.
	 * @returns {Vector3} the normalized vector.
	 */
	normalize() {
		const length = this.length();
		return (length === 0) ? Vector3.ZERO : this.divideScalar(length);
	}

	static min(a, b) {
		return new Vector3(Math.min(a.x, b.x), Math.min(a.y, b.y), Math.min(a.z, b.z));
	}

	static max(a, b) {
		return new Vector3(Math.max(a.x, b.x), Math.max(a.y, b.y), Math.max(a.z, b.z));
	}

	/** Construct a vector with the values of this vector rounded to the nearest integer (that is, floor of the 0.5 + the value).
	 * @return {Vector3}
	 */
	round() {
		return this.map((a) => Math.floor(a + 0.5));
	}

	/** Construct a vector with the values of this vector passed through the specified function.
	 * @param f {function} a function accepting a number and returning the mapped number. Will be applied to all coordinates.
	 * @return {Vector3}
	 */
	map(f) {
		return new Vector3(f(this.x), f(this.y), f(this.z));
	}

	noZ() {
		return new Vector3(this.x, this.y, 0);
	}
}

Vector3.ZERO = new Vector3(0, 0, 0);
Vector3.UNIT = new Vector3(1, 1, 1);

/** A line from one {Vector3} to another. */
class Line3 {
	constructor(a, b) {
		this.a = a;
		this.b = b;
	}

	/** Apply a function to each point on the line and construct a new line from the result.
	 * @param f {function} a function accepting a {Vector3} and returning the mapped vector.
	 * @returns {Line3}
	 */
	map(f) {
		return new Line3(f(this.a), f(this.b));
	}

	/** Construct a new line based on this line with both points having an offset added.
	 * @param offset {Vector3}
	 * @returns {Line3}
	 */
	add(offset) {
		return this.map((v) => v.add(offset));
	}

	/** Construct a new line based on this line with both points having an offset subtracted.
	 * @param offset {Vector3}
	 * @returns {Line3}
	 */
	subtract(offset) {
		return this.map((v) => v.subtract(offset));
	}

	/** Construct a new line from both points of this line multiplied by a scalar value.
	 * @param scalar {number}
	 * @returns {Line3}
	 */
	multiplyScalar(scalar) {
		return this.map((v) => v.multiplyScalar(scalar));
	}

	/** Construct a new line from both points of this line divided by a scalar value.
	 * @param scalar {number}
	 * @returns {Line3}
	 */
	divideScalar(scalar) {
		return this.map((v) => v.divideScalar(scalar));
	}

	/** Convert the line to a vector from point A to point B. That is the vector that, when added to A, produces B.
	 * @returns {Vector3}
	 */
	vector() {
		return this.b.subtract(this.a);
	}

	fullMin() {
		return Vector3.min(this.a, this.b);
	}

	fullMax() {
		return Vector3.max(this.a, this.b);
	}

	distance() {
		return this.a.subtract(this.b).length();
	}

	distanceSquared() {
		return this.a.subtract(this.b).lengthSquared();
	}

	intersects2(other) {
		const a = this.a;
		const b = this.b;
		const c = other.a;
		const d = other.b;

		var det, gamma, lambda;
		det = (b.x - a.x) * (d.y - c.y) - (d.x - c.x) * (b.y - a.y);
		if (det === 0) {
			return false;
		} else {
			lambda = ((d.y - c.y) * (d.x - a.x) + (c.x - d.x) * (d.y - a.y)) / det;
			gamma = ((a.y - b.y) * (d.x - a.x) + (b.x - a.x) * (d.y - a.y)) / det;
			return (0 < lambda && lambda < 1) && (0 < gamma && gamma < 1);
		}
	}
}

Line3.ZERO = new Line3(Vector3.ZERO, Vector3.ZERO);

/** A rectangular bounded by two corners. */
class Box3 {
	constructor(a, b) {
		this.a = a;
		this.b = b;
	}

	/** Construct a new square Box3 with a central vector and a "radius" that is added and subtracted from every coordinate of that vector to form opposite corners of the box.
	 * @param center {Vector3}
	 * @param radius {number}
	 * @returns {Box3}
	 */
	static fromRadius(center, radius) {
		const radiusVector = Vector3.UNIT.multiplyScalar(radius);
		return new Box3(center.subtract(radiusVector), center.add(radiusVector));
	}

	/** Construct a new Box3 by adding an offset to the first corner.
	 * @param start {Vector3} the first corner of the box
	 * @param offset {Vector3} the offset added to the first corner to form the second corner
	 * @returns {Box3}
	 */
	static fromOffset(start, offset) {
		return new Box3(start, start.add(offset));
	}

	/** Scale both vectors in the box by a scalar.
	 * @param scalar {number}
	 * @returns {Box3}
	 */
	scale(scalar) {
		return new Box3(this.a.multiplyScalar(scalar), this.b.multiplyScalar(scalar));
	}

	/** Get the Line3 running between the corners of the box.
	 * @returns {Line3}
	 */
	line() {
		return new Line3(this.a, this.b);
	}

	/** Apply function f to the corners of the box. Constructs a new Box3.
	 * @param f {function} a function that accepts a {Vector3} and returns the modified {Vector3}.
	 * @returns {Box3}
	 */
	map(f) {
		return new Box3(f(this.a), f(this.b));
	}
}

/** A set of connected vertices */
class Path {
	/** Start the path with an initial vertex.
	 * @param startPoint {Vector3}
	 */
	constructor(startPoint) {
		this.lines = [];
		this.origin = startPoint;
		this.at = Vector3.ZERO;
	}

	mapOrigin(f) {
		const path = new Path(f(this.origin));
		path.lines = this.lines;
		path.at = this.at;
		return path;
	}

	mapLines(f) {
		const path = new Path(this.origin);
		path.lines = this.lines.map((line) => line.map(f));
		path.at = f(this.at);
		return path;
	}

	/** Construct a path based on this one where the distance between vertices is limited by a specific radius.
	 * If any particular line between two vertices is too long, it will be recursive split with a new vertex between them until no line is too long.
	 * @param radius {number} the distance between consecutive vertices will always be at most this value
	 * @returns {Path}
	 */
	withBisectedLines(radius) {
		const path = new Path(this.origin);

		function addBisectedLine(line) {
			if(line.distance() >= radius) {
				const middle = line.a.add(line.b).divideScalar(2);
				const lineA = new Line3(line.a, middle);
				const lineB = new Line3(middle, line.b);
				addBisectedLine(lineA);
				addBisectedLine(lineB);
			}
			else {
				path.lines.push(line);
			}
		}

		for(const line of this.lines) {
			addBisectedLine(line);
		}

		path.at = this.at;
		return path;
	}

	/** Add a point to the path.
	 * @param nextPoint {Vector3}
	 */
	next(nextPoint) {
		const nextRelativePoint = nextPoint.subtract(this.origin);
		if(this.at.subtract(nextRelativePoint).lengthSquared() > 0) {
			this.lines.push(new Line3(this.at, nextRelativePoint));
			this.at = nextRelativePoint;
		}
	}

	lastLine() {
		const lastLine = this.lines[this.lines.length - 1];
		return lastLine ? lastLine : Line3.ZERO;
	}

	/** Get the last vertex in the path.
	 * @returns {Vector3}
	 */
	lastVertex() {
		return this.lastLine().b.add(this.origin);
	}

	pop() {
		const lastLine = this.lines.pop();
		return lastLine ? lastLine : Line3.ZERO;
	}

	push(line) {
		return this.lines.push(line);
	}

	/** Get all vertices of the path in addition order, starting with the origin.
	 * @returns {AsyncIterable.<Vector3>}
	 */
	* vertices() {
		yield this.origin;
		for(const line of this.lines) {
			yield line.b.add(this.origin);
		}
	}

	/** Get center of the path --- the mean of all vertices.
	 * @returns {Vector3}
	 */
	getCenter() {
		const vertices = Array.from(this.vertices());
		let sum = Vector3.ZERO;
		for(const vertex of vertices) {
			sum = sum.add(vertex);
		}
		return sum.divideScalar(vertices.length);
	}

	/** Get the distance from the center of the path to the furthest vertex.
	 * @returns {number}
	 */
	getRadius() {
		const center = this.getCenter();
		let furthest = center;
		for(const vertex of this.vertices()) {
			if(vertex.subtract(center).lengthSquared() >= furthest.subtract(center).lengthSquared()) {
				furthest = vertex;
			}
		}
		return furthest.subtract(center).length();
	}

	/** Get a new {Path} with only the last line of this path.
	 * @returns {Path}
	 */
	asMostRecent() {
		const lastLine = this.lastLine();
		const path = new Path(this.origin.add(lastLine.a));
		path.next(this.origin.add(lastLine.b));
		return path;
	}
}

const dirs = {};

dirs.N = new Vector3(0, -1, 0);
dirs.S = new Vector3(0, 1, 0);
dirs.W = new Vector3(-1, 0, 0);
dirs.E = new Vector3(1, 0, 0);

dirs.NW = dirs.N.add(dirs.W);
dirs.NE = dirs.N.add(dirs.E);
dirs.SW = dirs.S.add(dirs.W);
dirs.SE = dirs.S.add(dirs.E);

const dirKeys = Object.keys(dirs);

const normalizedDirs = {};

for(const dirName of dirKeys) {
	normalizedDirs[dirName] = dirs[dirName].normalize();
}

const dirAngles = {};
for(const dirName of dirKeys) {
	const dir = dirs[dirName];
	dirAngles[dirName] = Math.atan2(dir.y, dir.x);
}

/** Get an array from an asynchronous iterable.
 * @param asyncIterable {AsyncIterable} any async interable (like an asynchronous generator)
 * @param mapFunction {AsyncFunction|function|undefined} a callback to map values from the asyncIterable to final return values in the array
 * @returns {Array}
 */
async function asyncFrom(asyncIterable, mapFunction) {
	const values = [];
	if(mapFunction === undefined) {
		for await (const value of asyncIterable) {
			values.push(value);
		}
	}
	else if(mapFunction.constructor.name === "AsyncFunction") {
		for await (const value of asyncIterable) {
			values.push(await mapFunction(value));
		}
	}
	else {
		for await (const value of asyncIterable) {
			values.push(mapFunction(value));
		}
	}
	return values;
}

/** Calculate modulo with behavior for negative dividends.
 * E.g. mod(7, 4) === 3 && mod(-11, 7) === 3
 * @param n {number} the dividend
 * @param m {number} the divisor
 * @returns {number} the modulo (m % n)
 */
function mod(n, m) {
	return ((n % m) + m) % m;
}

/** Merge multiply associative array objects together into a new object.
 * Properties in later objects will override properties in earlier objects.
 * @param ...args Objects to merge together
 * @returns {Object} the merged object
 */
function merge(...args) {
	const r = {};
	for(const arg of args) {
		if(arg) {
			for(const k in arg) {
				r[k] = arg[k];
			}
		}
	}
	return r;
}

function weightedRandom(weightedPairs) {
	let weightSum = 0;
	for(const weightedPair of weightedPairs) {
		if(weightedPair[1] === Infinity) {
			return weightedPair[0];
		}
		weightSum += weightedPair[1];
	}

	let random = Math.random() * weightSum;

	for(const weightedPair of weightedPairs) {
		random -= weightedPair[1];
		if(random <= 0) {
			return weightedPair[0];
		}
	}
}

/** Generic reference to an entity.
 * Do not construct manually, use backend methods. */
class EntityRef {
	constructor(id, backend) {
		this.id = id;
		this.backend = backend;
		this.cache = this.backend.getEntityCache(id);
		this.propertyCache = this.cache.properties;
	}

	/** Check if this entity exists in the database.
	 * @returns {boolean}
	 */
	async exists() {
		return this.backend.entityExists(this.id);
	}

	/** Check if this entity is valid (i.e. not deleted).
	 * @returns {boolean}
	 */
	async valid() {
		return this.backend.entityValid(this.id);
	}

	/** Get a number property. */
	async getPNumber(propertyName) {
		let value = this.propertyCache[propertyName];
		if(value === undefined) {
			value = this.propertyCache[propertyName] = this.backend.getPNumber(this.id, propertyName);
		}
		return value;
	}

	/** Get a string property. */
	async getPString(propertyName) {
		let value = this.propertyCache[propertyName];
		if(value === undefined) {
			value = this.propertyCache[propertyName] = this.backend.getPString(this.id, propertyName);
		}
		return value;
	}

	/** Get a Vector3 property. */
	async getPVector3(propertyName) {
		let value = this.propertyCache[propertyName];
		if(value === undefined) {
			value = this.propertyCache[propertyName] = this.backend.getPVector3(this.id, propertyName);
		}
		return value;
	}

	/** Set a number property. */
	async setPNumber(propertyName, value) {
		this.propertyCache[propertyName] = value;
		return this.backend.setPNumber(this.id, propertyName, value);
	}

	/** Set a string property. */
	async setPString(propertyName, value) {
		this.propertyCache[propertyName] = value;
		return this.backend.setPString(this.id, propertyName, value);
	}

	/** Set a Vector3 property. */
	async setPVector3(propertyName, v) {
		this.propertyCache[propertyName] = v;
		return this.backend.setPVector3(this.id, propertyName, v);
	}

	/** Remove this entity from the database. */
	async remove() {
		return this.backend.removeEntity(this.id);
	}

	async unremove() {
		return this.backend.unremoveEntity(this.id);
	}
}

/** Reference to a node entity.
 * Do not construct manually, use backend methods. */
class NodeRef extends EntityRef {
	constructor(id, backend) {
		super(id, backend);
	}

	/** Called when the node is created. */
	async create() {
		this.cache.edges = [];
		this.cache.neighbors = [];
		await this.clearParentCache();
	}

	async clearParentCache() {
		const parent = await this.getParent();
		if(parent) {
			delete parent.cache.children;
		}
	}

	async clearNeighborCache() {
		for await (const nodeRef of this.getSelfAndNeighbors()) {
			delete nodeRef.cache.edges;
			delete nodeRef.cache.neighbors;
		}
	}

	/** Get the base type of this node. See backend getNodeType().
	 * @returns {string}
	 */
	async getNodeType() {
		let type = this.cache.type;
		if(type === undefined) {
			type = this.cache.type = await this.backend.getNodeType(this.id);
		}
		return type;
	}

	/** Get the parent node of this node, if it exists.
	 * @returns {NodeRef|null} The parent node, or null if there is no parent.
	 */
	async getParent() {
		let parent = this.cache.parent;
		if(parent === undefined) {
			parent = this.cache.parent = this.backend.getNodeParent(this.id);
		}
		return parent;
	}

	/** Get all children of this node.
	 * @returns {AsyncIterable.<NodeRef>}
	 */
	async * getChildren() {
		let children = this.cache.children;
		if(children === undefined) {
			children = this.cache.children = await asyncFrom(this.backend.getNodeChildren(this.id));
		}

		yield* children;
	}

	async hasChildren() {
		return this.backend.nodeHasChildren(this.id);
	}

	async * getAllDescendants() {
		for (const child of await asyncFrom(this.getChildren())) {
			yield child;
			yield* child.getAllDescendants();
		}
	}

	async * getSelfAndAllDescendants() {
		yield this;
		for (const child of await asyncFrom(this.getChildren())) {
			yield* child.getSelfAndAllDescendants();
		}
	}

	async * getNeighbors() {
		let neighbors = this.cache.neighbors;

		if(neighbors === undefined) {
			neighbors = this.cache.neighbors = await asyncFrom(this.getEdges(), async (edge) => await edge.getDirOtherNode());
		}

		yield* neighbors;
	}

	async * getSelfAndNeighbors() {
		yield this;
		yield* this.getNeighbors();
	}

	/** Set the "center" property of this node.
	 * @param v {Vector3}
	 */
	async setCenter(v) {
		return this.setPVector3("center", v);
	}

	/** Get the "center" property of this node.
	 * @returns {Vector3}
	 */
	async getCenter() {
		return this.getPVector3("center");
	}

	async setEffectiveCenter(v) {
		return this.setPVector3("eCenter", v);
	}

	async getEffectiveCenter() {
		return this.getPVector3("eCenter");
	}

	async setType(type) {
		return this.setPString("type", type.id);
	}

	async getType() {
		return this.backend.nodeTypeRegistry.get(await this.getPString("type"));
	}

	async setRadius(radius) {
		return this.setPNumber("radius", radius);
	}

	async getRadius() {
		return this.getPNumber("radius");
	}

	async getLayer() {
		const layerId = await this.getPString("layer");
		return layerId ? this.backend.layerRegistry.get(layerId) : this.backend.layerRegistry.getDefault();
	}

	async setLayer(layer) {
		return this.setPString("layer", layer.id);
	}

	/** Get all edges connected to this node.
	 * @returns {AsyncIterable.<DirEdgeRef>} all the edges, with direction information from this node.
	 */
	async * getEdges() {
		let edges = this.cache.edges;
		if(edges === undefined) {
			edges = this.cache.edges = await asyncFrom(this.backend.getNodeEdges(this.id));
		}
		yield* edges;
	}

	/** Remove this entity from the database. */
	async remove() {
		await this.clearParentCache();
		await this.clearNeighborCache();
		return this.backend.removeNode(this.id);
	}

	async unremove() {
		super.unremove();
		await this.clearParentCache();
		await this.clearNeighborCache();
	}
}

/** Reference to an edge entity.
 * Do not construct manually, use backend methods. */
class EdgeRef extends EntityRef {
	/** Called when the node is created. */
	async create() {
		await this.addToNeighborCache();
	}

	async addToNeighborCache() {
		const nodes = await asyncFrom(this.getNodes());
		for(let i = 0; i < nodes.length; i++) {
			const nodeRef = nodes[i];

			const edges = nodeRef.cache.edges;
			if(edges) {
				edges.push(this.backend.getDirEdgeRef(this.id, nodeRef.id));
			}

			const neighbors = nodeRef.cache.neighbors;
			if(neighbors) {
				neighbors.push(nodes[(i + 1) % 2]);
			}
		}
	}

	async clearNeighborCache() {
		for await (const nodeRef of this.getNodes()) {
			delete nodeRef.cache.edges;
			delete nodeRef.cache.neighbors;
		}
	}

	/** Get the (two) nodes connected to this edge.
	 * @returns {AsyncIterable.<NodeRef>}
	 */
	async * getNodes() {
		yield* this.backend.getEdgeNodes(this.id);
	}

	/** Get the other node connected to this edge, given one of the connected nodes.
	 * @param startId {number} the known node ID.
	 * @returns {NodeRef} the other node connected to this edge.
	 */
	async getOtherNode(startId) {
		return this.backend.getEdgeOtherNode(this.id, startId);
	}

	/** Get the spatial line between the centers of each node on this edge.
	 * @returns {Line3}
	 */
	async getLine() {
		const [a, b] = await asyncFrom(this.getNodes(), async nodeRef => nodeRef.getCenter());
		return new Line3(a, b);
	}

	async remove() {
		await this.clearNeighborCache();
		return this.backend.removeEdge(this.id);
	}

	async unremove() {
		super.unremove();
		await this.clearNeighborCache();
	}
}

/** {EdgeRef} with directional information (what node it starts from).
 * While edges are bidirectional, the DirEdgeRef can simplify working with other nodes when only one side of the edge is known.
 */
class DirEdgeRef extends EdgeRef {
	constructor(id, startId, backend) {
		super(id, backend);
		this.startId = startId;
	}

	/** Get the other (unknown) node from this reference.
	 * @returns {NodeRef}
	 */
	async getDirOtherNode() {
		return this.getOtherNode(this.startId);
	}
}

/** A simple hook system.
 * Allows registering functions to be called on arbitrary events/hooks,
 * and allows calling all functions registered for each event/hook.
 */
class HookContainer {
	constructor() {
		this.hooks = {};
	}

	/** Register a function to be called upon a specific hook.
	 * @param hookName {string} The name of the hook this method will be called on.
	 * @param hookFunction {function} A function that will be called when the specified hook is called.
	 */
	add(hookName, hookFunction) {
		if(!(hookName in this.hooks)) {
			this.hooks[hookName] = [];
		}

		this.hooks[hookName].push(hookFunction);
	}

	/** Remove a function from being called upon a specific hook.
	 * @param hookName {string} The name of the hook to remove from.
	 * @param hookFunction {function} The function to remove from the hook.
	 */
	remove(hookName, hookFunction) {
		if(hookName in this.hooks) {
			this.hooks[hookName] = this.hooks[hookName].filter(f => f !== hookFunction);
		}
	}

	/** Call all functions registered for a specific hook.
	 * @param hookName {string} The hook to call.
	 * @param ...args Remaining arguments are passed to the hook functions.
	 */
	async call(hookName, ...args) {
		if(hookName in this.hooks) {
			for(const hookFunction of this.hooks[hookName]) {
				await hookFunction(...args);
			}
		}
	}
}

class NodeType {
	constructor(id, def) {
		this.id = id;
		this.def = def;
	}

	getDescription() {
		return this.id;
	}

	getColor() {
		return this.def.color || "black";
	}

	receivesBackground() {
		return ((this.def.receivesBackground === false) ? false : true) && !this.givesBackground() && this.getImageName();
	}

	givesBackground() {
		return !!this.def.givesBackground;
	}

	getImageName() {
		return this.def.image;
	}

	getLayer() {
		return this.def.layer || "geographical";
	}

	getScale() {
		return this.def.scale || "terrain";
	}

	isArea() {
		return (this.def.area === false) ? false : true;
	}

	isPath() {
		return !!this.def.path;
	}
}

class NodeTypeRegistry {
	constructor() {
		this.types = {};

		this.registerType(new NodeType("water", {
			color: "darkblue",
			image: "water",
			receivesBackground: false,
		}));

		this.registerType(new NodeType("grass", {
			color: "green",
			image: "grass",
			givesBackground: true,
		}));

		this.registerType(new NodeType("forest", {
			color: "green",
			image: "forest",
		}));

		this.registerType(new NodeType("tree", {
			color: "darkgreen",
			scale: "explicit",
		}));

		this.registerType(new NodeType("rocks", {
			color: "gray",
			image: "rocks",
		}));

		this.registerType(new NodeType("stone", {
			color: "gray",
			scale: "explicit",
		}));

		this.registerType(new NodeType("road", {
			color: "brown",
			path: true,
		}));

		this.registerType(new NodeType("buildings", {
			color: "yellow",
		}));

		this.registerType(new NodeType("tower", {
			color: "yellow",
			scale: "explicit",
		}));

		this.registerType(new NodeType("region", {
			color: "orange",
			layer: "political",
		}));

		this.registerType(new NodeType("route", {
			color: "white",
			layer: "political",
			path: true,
			area: false,
		}));

		this.registerType(new NodeType("note", {
			color: "white",
			layer: "annotation",
		}));
	}

	registerType(nodeType) {
		this.types[nodeType.id] = nodeType;
	}

	* getTypes() {
		for(const k in this.types) {
			yield this.types[k];
		}
	}

	get(typeId) {
		return this.types[typeId];
	}
}

class Layer {
	constructor(id, def) {
		this.id = id;
		this.def = def;
	}

	getDescription() {
		return this.id;
	}

	getType() {
		return this.def.type;
	}

	getDrawType() {
		return this.getType() === "geographical" ? "area" : "border";
	}

	getZ() {
		return this.def.z ? this.def.z : 0;
	}
}

class LayerRegistry {
	constructor() {
		this.layers = {};

		this.registerLayer(new Layer("geographical", {
			type: "geographical",
			z: 0,
		}));

		this.registerLayer(new Layer("political", {
			type: "political",
			z: 10,
		}));

		this.registerLayer(new Layer("annotation", {
			type: "annotation",
			z: 15,
		}));
	}

	registerLayer(layer) {
		this.layers[layer.id] = layer;
	}

	* getLayers() {
		for(const k in this.layers) {
			yield this.layers[k];
		}
	}

	get(id) {
		return this.layers[id];
	}

	getDefault() {
		return this.get("geographical");
	}
}

/** Abstract mapper backend, i.e. what map is being presented.
 * The backend translates between the concept of a map and a database, a file, an API, or whatever else is actually being used to store the data.
 * Most methods here are low-level; users of the backend should use methods from EntityRef and its children which delegate to the MapBackend.
 *
 * Underlying structure:
 * The backend consists of a set of entities, which can have arbitrary properties.
 * A special entity, "global", is used for properties of the whole map.
 * Two types of entities have specific handling to form a graph:
 * "node" - an entity with a parent and positional information.
 * "edge" - an entity connecting two adjacent nodes.
 */
class MapBackend {
	constructor() {
		this.loaded = false;
		this.hooks = new HookContainer();
		this.nodeTypeRegistry = new NodeTypeRegistry();
		this.layerRegistry = new LayerRegistry();
		this.entityCache = {};
	}

	getEntityCache(id) {
		let cache = this.entityCache[id];
		if(cache === undefined) {
			cache = this.entityCache[id] = {
				properties: {},
			};
		}
		return cache;
	}

	/** Get the database version number. Implementation defined.
	 * @returns {number}
	 */
	getVersionNumber() {
		throw "getVersionNumber not defined";
	}

	/** Get the latest backend version number. Implementation defined. Must be greater than zero.
	 * @returns {number}
	 */
	getBackendVersionNumber() {
		throw "getBackendVersionNumber not defined";

	}

	/** Get a number property on an entity.
	 * Has a default implementation based on string properties.
	 * @returns {number}
	 */
	async getPNumber(entityId, propertyName) {
		return parseFloat(await this.getPString(entityId, propertyName));
	}

	/** Set a number property on an entity.
	 * Has a default implementation based on string properties.
	 */
	async setPNumber(entityId, propertyName, value) {
		return this.setPString(entityId, propertyName, value.toString());
	}

	/** Set a Vector3 property on an entity.
	 * Has a default implementation based on string properties.
	 */
	async setPVector3(entityId, propertyName, v) {
		return this.setPString(entityId, propertyName, JSON.stringify(v));
	}

	/** Get a Vector3 property on an entity.
	 * Has a default implementation based on string properties.
	 * @returns {Vector3}
	 */
	async getPVector3(entityId, propertyName) {
		const object = JSON.parse(await this.getPString(entityId, propertyName));
		return Vector3.fromJSON(object.x, object.y, object.z);
	}

	/** Get a string property on an entity.
	 * @returns {string}
	 */
	async getPString(entityId, propertyName) {
		throw "getPString not implemented";
	}

	/** Set a string property on an entity. */
	async setPString(entityId, propertyName, value) {
		throw "setPString not implemented";
	}

	/** Create a new entity in the backend.
	 * @param type {string} Type of the new entity.
	 * @returns {EntityRef}
	 */
	async createEntity(type) {
		throw "createEntity not implemented";
	}

	/** Creates a new "node" entity.
	 * @param parentId {number|undefined} ID of the parent node, or undefined if the node has no parent.
	 * @param nodeType {string} Type of the node. "object" or "point".
	 * @returns {NodeRef}
	 */
	async createNode(parentId, nodeType) {
		throw "createNode not implemented";
	}

	/** Get the parent node of a node by ID, or null if the node has no parent.
	 * @returns {NodeRef|null}
	 */
	async getNodeParent(nodeId) {
		throw "getNodeParent not implemented";
	}

	/** Get all direct children of a node.
	 * @returns {AsyncIterable.<NodeRef>}
	 */
	async getNodeChildren(nodeId) {
		throw "getNodeChildren not implemented";
	}

	/** Check if a node has any children.
	 * Has a default implementation based on #getNodeChildren().
	 * @returns {boolean}
	 */
	async nodeHasChildren(nodeId) {
		return (await asyncFrom(this.getNodeChildren(nodeId))).length > 0;
	}

	/** Get a node's type.
	 * @returns {string}
	 */
	async getNodeType(nodeId) {
		throw "getNodeType not implemented";
	}

	/** Create a new edge between two nodes.
	 * Order of node IDs does not matter.
	 * @param nodeAId {number} The ID of one of the nodes on the edge.
	 * @param nodeBId {number} The ID of the other node on the edge.
	 * @returns {EdgeRef} A reference to the new edge.
	 */
	async createEdge(nodeAId, nodeBId) {
		throw "createEdge not implemented";
	}

	/** Get all edges attached to a node.
	 * @returns {AsyncIterable.<EdgeRef>}
	 */
	async getNodeEdges(nodeId) {
		throw "getNodeEdges not implemented";
	}

	/** Get the two nodes attached to an edge, in no particular order.
	 * @returns {AsyncIterable.<NodeRef>}
	 */
	async getEdgeNodes(edgeId) {
		throw "getEdgeNodes not implemented";
	}

	/** Given an edge and one of the nodes on the edge, get the other node on the edge.
	 * @param edgeId {number}
	 * @param nodeId {number}
	 * Has a default implementation based on #getEdgeNodes().
	 * @returns {NodeRef}
	 */
	async getEdgeOtherNode(edgeId, nodeId) {
		const [nodeA, nodeB] = await asyncFrom(this.getEdgeNodes(edgeId));
		return (nodeA.id == nodeId) ? nodeB : nodeA;
	}

	/** Remove an edge from the backend.
	 * Has a default implementation that just removes the entity.
	 */
	async removeEdge(edgeId) {
		return this.removeEntity(edgeId);
	}

	/** Remove a node from the backend.
	 * Has a default implementation that just removes the entity.
	 */
	async removeNode(nodeId) {
		return this.removeEntity(nodeId);
	}

	/** Check if an entity exists.
	 * @returns {boolean}
	 */
	async entityExists(entityId) {
		throw "entityExists not implemented";
	}

	/** Remove an entity from the backend.
	 * This method should work to remove any entity.
	 * However, calling code should use #removeEdge() and #removeNode() when applicable instead, for potential optimization purposes.
	 */
	async removeEntity(entityId) {
		throw "removeEntity not implemented";
	}

	/** Flush the backend to storage.
	 * This may happen automatically, but flush forces it.
	 * Has a default implementation that does nothing.
	 */
	async flush() {
	}

	/** Create an EntityRef to an entity in this backend.
	 * Use getNodeRef, getEdgeRef, or getDirEdgeRef for greater type-specific functionality if the entity is a node or edge.
	 */
	getEntityRef(id) {
		return new EntityRef(id, this);
	}

	/** Create a NodeRef to a node in this backend. */
	getNodeRef(id) {
		return new NodeRef(id, this);
	}

	/** Create an EdgeRef to an edge in this backend. */
	getEdgeRef(id) {
		return new EdgeRef(id, this);
	}

	/** Create a DirEdgeRef to an edge in this backend, starting from the specified node.
	 * @param id {number} The ID of the edge to get.
	 * @param startId {number} The ID of a node attached to this edge.
	 * @returns {DirEdgeRef} Starting from the specified start ID.
	 */
	getDirEdgeRef(id, startId) {
		return new DirEdgeRef(id, startId, this);
	}

	/** Get all nodes within a spatial box.
	 * @param box {Box3} The box to find nodes within.
	 * @returns {AsyncIterable.<NodeRef>}
	 */
	getNodesInArea(box) {
		throw "getNodesInArea not implemented";
	}

	/** Get all nodes in or near a spatial box (according to their radii).
	 * @param box {Box3} The box to find nodes within or near.
	 * @param minRadius {number} The minimum radius of nodes to return.
	 * @returns {AsyncIterable.<NodeRef>}
	 */
	getObjectNodesTouchingArea(box, minRadius) {
		throw "getObjectNodesTouchingArea not implemented";
	}

	/** Get the edge between two nodes, if it exists.
	 * @param nodeAId {number} The ID of one of the nodes on the edge to find.
	 * @param nodeBId {number} The ID of the other node on the edge to find.
	 * @returns {EdgeRef}
	 */
	getEdgeBetween(nodeAId, nodeBId) {
		throw "getEdgeBetween not implemented";
	}

	/** Get all nearby nodes within a specified blend distance of the specified node.
	 * Has a default implementation based on #getNodesInArea().
	 * @param nodeRef {NodeRef} The node that is the spatial center of the search.
	 * @param blendDistance {number} How far out to look for nodes? (Necessary to avoid searching the entire map.)
	 * @returns {AsyncIterable.<NodeRef>} All the discovered nodes. Does not include the original node.
	 */
	async * getNearbyNodes(nodeRef, blendDistance) {
		for await (const otherNodeRef of this.getNodesInArea(Box3.fromRadius(await nodeRef.getCenter(), blendDistance))) {
			if(otherNodeRef.id !== nodeRef.id) {
				yield otherNodeRef;
			}
		}
	}

	/** Get all nodes connected to the specified node by one level of edges (that is, one edge).
	 * Has a default implementation based on #getNodeEdges().
	 * @param nodeRef {NodeRef} The node to search for connections on.
	 * @returns {AsyncIterable.<NodeRef>} The connected nodes.
	 */
	async * getConnectedNodes(nodeRef) {
		for await (const dirEdgeRef of this.getNodeEdges(nodeRef.id)) {
			yield await dirEdgeRef.getDirOtherNode();
		}
	}

	/** Get all edges within a specified blend distance that intersect with the given edge.
	 * Has a default implementation based on #getNodesInArea() and #NodeRef.getEdges().
	 * @param edgeRef {EdgeRef} The edge to search for intersections on.
	 * @param blendDistance {number} How far out to search for intersections? (Necessary to avoid searching the entire map.)
	 * @returns {AsyncIterable.<EdgeRef>} Each intersecting edge found.
	 */
	async * getIntersectingEdges(edgeRef, blendDistance) {
		const line = await edgeRef.getLine();
		const distance = Vector3.UNIT.multiplyScalar(blendDistance);

		const seen = {
			[edgeRef.id]: true,
		};

		for await (const nodeRef of this.getNodesInArea(new Box3(line.fullMin().subtract(distance), line.fullMax().add(distance)))) {
			for await (const dirEdgeRef of nodeRef.getEdges()) {
				if(!seen[dirEdgeRef.id]) {
					seen[dirEdgeRef.id] = true;

					if(line.intersects2(await dirEdgeRef.getLine())) {
						yield dirEdgeRef;
					}
				}
			}
		}
	}
}

// Load [sql.js](https://sql.js.org) from the remote server.
// Will not attempt to load until the function is called the first time to avoid unnecessary remote fetches.
let sqlJsPromise;
async function SqlJs() {
	if(sqlJsPromise === undefined) {
		sqlJsPromise = new Promise((resolve, reject) => {
			const script = document.createElement("script");
			script.src = "https://sql.js.org/dist/sql-wasm.js";
			script.addEventListener("load", async function() {
				const SQL = await window.initSqlJs({
					locateFile: file => `https://sql.js.org/dist/${file}`,
				});

				resolve(SQL);
			});
			script.addEventListener("error", reject);
			document.head.appendChild(script);
		});
	}
	return await sqlJsPromise;
}

/** SQLite-backed map backend, using [sql.js](https://sql.js.org).
 * Each map is an individual SQLite database file stored in memory.
 * This backend is built for the online demo usecase.
 */
class SqlJsMapBackend extends MapBackend {
	/** Ready the backend on a specific database filename.
	 * The backend cannot be used until #load() finishes.
	 * Options may have keys:
	 * - loadFrom: "none", "url", or "data"
	 */
	constructor(options) {
		super();

		this.options = merge({
			loadFrom: "none",
			url: null,
			data: null,
			buildDatabase: true,
		}, options);
	}

	async load() {
		const Database = (await SqlJs()).Database;

		if(this.options.loadFrom === "url") {
			this.db = new Database(new Uint8Array(await (await fetch(this.options.url)).arrayBuffer()));
		}
		else if(this.options.loadFrom === "data") {
			this.db = new Database(this.options.data);
		}
		else {
			this.db = new Database();
		}

		this.s_getVersionNumber = this.db.prepare("PRAGMA user_version");

		let gotVersion = this.getVersionNumber();
		const wantVersion = this.getBackendVersionNumber();

		// No version yet, let's see if there are any tables or else this is a fresh DB.
		if(gotVersion === 0) {
			if(this.db.prepare("SELECT name FROM sqlite_master WHERE type = 'table' AND name = 'entity'").get({}).length === 0) {
				this.db.run("PRAGMA user_version = " + wantVersion);
			}
		}

		if(this.getVersionNumber() == 2) {
			await this.upgradeVersion2to3();
		}

		gotVersion = this.getVersionNumber();

		if(gotVersion !== wantVersion) {
			throw new Error("version number does not match (got " + gotVersion + ", wanted " + wantVersion + ")");
		}

		this.db.run("PRAGMA foreign_keys = ON");
		this.db.run("PRAGMA recursive_triggers = ON");

		this.db.run("CREATE TABLE IF NOT EXISTS entity (entityid INTEGER PRIMARY KEY, type TEXT, valid BOOLEAN)");

		// Node table and trigger to delete the corresponding entity when a node is deleted.
		this.db.run("CREATE TABLE IF NOT EXISTS node (entityid INT PRIMARY KEY, nodetype TEXT, parentid INT, FOREIGN KEY (entityid) REFERENCES entity(entityid) ON DELETE CASCADE, FOREIGN KEY (parentid) REFERENCES node(entityid) ON DELETE CASCADE)");

		if(this.options.buildDatabase) {
			this.db.run("CREATE TRIGGER IF NOT EXISTS r_nodedeleted AFTER DELETE ON node FOR EACH ROW BEGIN DELETE FROM entity WHERE entityid = OLD.entityid; END");
		}

		// Triggers to cascade invalidation
		if(this.options.buildDatabase) {
			this.db.run("CREATE TRIGGER IF NOT EXISTS r_nodeinvalidated_children AFTER UPDATE OF valid ON entity WHEN NEW.type = 'node' AND NEW.valid = false BEGIN UPDATE entity SET valid = FALSE WHERE entityid IN (SELECT entityid FROM node WHERE parentid = NEW.entityid); END");
		}

		this.db.run("CREATE TABLE IF NOT EXISTS edge (entityid INT PRIMARY KEY, FOREIGN KEY (entityid) REFERENCES entity(entityid) ON DELETE CASCADE)");
		this.db.run("CREATE TABLE IF NOT EXISTS node_edge (edgeid INT, nodeid INT, PRIMARY KEY (edgeid, nodeid) FOREIGN KEY (edgeid) REFERENCES entity(entityid) ON DELETE CASCADE, FOREIGN KEY (nodeid) REFERENCES node(entityid) ON DELETE CASCADE)");
		// Similar to nodes, a edge's corresponding entity will be deleted via trigger as soon as the edge is deleted.
		if(this.options.buildDatabase) {
			this.db.run("CREATE TRIGGER IF NOT EXISTS r_edgedeleted AFTER DELETE ON edge FOR EACH ROW BEGIN DELETE FROM entity WHERE entityid = OLD.entityid; END");
			this.db.run("CREATE TRIGGER IF NOT EXISTS r_node_edgedeleted AFTER DELETE ON node_edge FOR EACH ROW BEGIN DELETE FROM entity WHERE entityid = OLD.edgeid; END");
		}

		/* Multiple types of property are possible, all combined into one table for now.
		 * Each property can be (with columns):
		 * 	string (v_string TEXT)
		 * 	number (v_number REAL)
		 * 	vector3 (x, y, and z REAL)
		 * The columns corresponding to the other property types are NULL or disregarded.
		 */
		this.db.run("CREATE TABLE IF NOT EXISTS property (entityid INT, property TEXT, v_string TEXT, v_number REAL, x REAL, y REAL, z REAL, PRIMARY KEY (entityid, property), FOREIGN KEY (entityid) REFERENCES entity(entityid) ON DELETE CASCADE)");

		// Property access prepared statements.
		this.s_gpn = this.db.prepare("SELECT v_number FROM property WHERE entityid = $entityId AND property = $property");
		this.s_spn = this.db.prepare("INSERT OR REPLACE INTO property (entityid, property, v_number) VALUES ($entityId, $property, $value)");
		this.s_gpv3 = this.db.prepare("SELECT x, y, z FROM property WHERE entityid = $entityId AND property = $property");
		this.s_spv3 = this.db.prepare("INSERT OR REPLACE INTO property (entityid, property, x, y, z) VALUES ($entityId, $property, $x, $y, $z)");
		this.s_gps = this.db.prepare("SELECT v_string FROM property WHERE entityid = $entityId AND property = $property");
		this.s_sps = this.db.prepare("INSERT OR REPLACE INTO property (entityid, property, v_string) VALUES ($entityId, $property, $value)");

		this.s_entityExists = this.db.prepare("SELECT entityid FROM entity WHERE entityid = $entityId");
		this.s_entityValid = this.db.prepare("SELECT entityid FROM entity WHERE entityid = $entityId AND valid = TRUE");

		this.s_createEntity = this.db.prepare("INSERT INTO entity (type, valid) VALUES ($type, TRUE)");
		this.s_createNode = this.db.prepare("INSERT INTO node (entityid, parentid, nodetype) VALUES ($entityId, $parentId, $nodeType)");
		this.s_createEdge = this.db.prepare("INSERT INTO edge (entityid) VALUES ($entityId)");
		this.s_createConnection = this.db.prepare("INSERT INTO node_edge (edgeid, nodeid) VALUES ($edgeId, $nodeId)");

		this.s_getNodeType = this.db.prepare("SELECT nodetype FROM node WHERE node.entityid = $nodeId");

		this.s_getNodeParent = this.db.prepare("SELECT nodep.entityid AS parentid FROM node AS nodep INNER JOIN node AS nodec ON nodep.entityid = nodec.parentid INNER JOIN entity ON entity.entityid = nodep.entityid WHERE entity.valid = true AND nodec.entityid = $nodeId");
		this.s_getNodeChildren = this.db.prepare("SELECT node.entityid FROM node INNER JOIN entity ON node.entityid = entity.entityid WHERE parentID = $nodeId AND entity.valid = true");
		this.s_getNodeEdges = this.db.prepare("SELECT edge1.edgeid FROM node_edge edge1 INNER JOIN node_edge edge2 ON (edge1.edgeid = edge2.edgeid AND edge1.nodeid != edge2.nodeid) INNER JOIN entity entity1 ON entity1.entityid = edge1.edgeid INNER JOIN entity entity2 ON entity2.entityid = edge2.nodeid INNER JOIN entity nodeentity1 ON nodeentity1.entityid = edge1.nodeid INNER JOIN entity nodeentity2 ON nodeentity2.entityid = edge2.nodeid WHERE edge1.nodeid = $nodeId AND entity1.valid = true AND entity2.valid = true AND nodeentity1.valid = TRUE AND nodeentity2.valid = TRUE");
		this.s_getEdgeNodes = this.db.prepare("SELECT nodeid FROM node_edge INNER JOIN entity ON nodeid = entity.entityid WHERE edgeid = $edgeId");

		this.s_getEdgeBetween = this.db.prepare("SELECT edge1.edgeid AS edgeid FROM node_edge edge1 INNER JOIN node_edge edge2 ON (edge1.edgeid = edge2.edgeid AND edge1.nodeid != edge2.nodeid) INNER JOIN entity WHERE edge1.edgeid = entity.entityid AND edge1.nodeid = $nodeAId AND edge2.nodeid = $nodeBId AND entity.valid = TRUE");

		this.s_getNodesTouchingArea = this.db.prepare("SELECT node.entityid FROM node INNER JOIN property ON node.entityid = property.entityid INNER JOIN entity ON node.entityid = entity.entityid INNER JOIN property AS radiusproperty ON node.entityid = radiusproperty.entityid WHERE entity.valid = TRUE AND property.property = 'center' AND radiusproperty.property = 'radius' AND radiusproperty.v_number >= $minRadius AND property.x >= $ax - radiusproperty.v_number AND property.x <= $bx + radiusproperty.v_number AND property.y >= $ay - radiusproperty.v_number AND property.y <= $by + radiusproperty.v_number AND property.z >= $az - radiusproperty.v_number AND property.z <= $bz + radiusproperty.v_number");

		this.s_getObjectNodesTouchingArea = this.db.prepare("SELECT node.entityid FROM node INNER JOIN property ON node.entityid = property.entityid INNER JOIN entity ON node.entityid = entity.entityid INNER JOIN property AS radiusproperty ON node.entityid = radiusproperty.entityid WHERE entity.valid = TRUE AND property.property = 'center' AND radiusproperty.property = 'radius' AND radiusproperty.v_number >= $minRadius AND property.x >= $ax - radiusproperty.v_number AND property.x <= $bx + radiusproperty.v_number AND property.y >= $ay - radiusproperty.v_number AND property.y <= $by + radiusproperty.v_number AND property.z >= $az - radiusproperty.v_number AND property.z <= $bz + radiusproperty.v_number AND node.nodetype = 'object'");

		// Triggers & foreign key constraints will handle deleting everything else relating to the entity.
		this.s_deleteEntity = this.db.prepare("DELETE FROM entity WHERE entityid = $entityId");
		this.s_invalidateEntity = this.db.prepare("UPDATE entity SET valid = FALSE WHERE entityid = $entityId AND valid = TRUE");
		this.s_validateEntity = this.db.prepare("UPDATE entity SET valid = TRUE WHERE entityid = $entityId");

		/* Find or create the global entity.
		 * There can be only one.
		 */
		if(this.options.buildDatabase) {
			this.db.run("BEGIN EXCLUSIVE TRANSACTION");
			let globalEntityIdRow = this.db.prepare("SELECT entityid FROM entity WHERE type = 'global'").get({});
			if(globalEntityIdRow.length === 0) {
				this.global = this.getEntityRef(this.baseCreateEntity("global"));
			}
			else {
				this.global = this.getEntityRef(globalEntityIdRow[0]);
			}
			this.db.run("COMMIT");
		}

		/** Create a node atomically.
		 * @param parentId {number|null} The ID of the node's parent, or null if none.
		 * @param nodeType {string} The base type of the node.
		 * @returns {number} The ID of the new node.
		 */
		this.baseCreateNode = (parentId, nodeType) => {
			this.db.run("BEGIN EXCLUSIVE TRANSACTION");
			const id = this.baseCreateEntity("node");
			this.s_createNode.run({$entityId: id, $parentId: parentId ? parentId : null, $nodeType: nodeType});
			this.db.run("COMMIT");
			return id;
		};

		/** Create an edge atomically.
		 * @param nodeAId {number} The ID of one of the nodes on the edge.
		 * @param nodeBId {number} The ID of the other node on the edge.
		 * @returns {number} The ID of the new edge.
		 */
		this.baseCreateEdge = (nodeAId, nodeBId) => {
			this.db.run("BEGIN EXCLUSIVE TRANSACTION");
			const id = this.baseCreateEntity("edge");
			this.s_createEdge.run({$entityId: id});
			this.s_createConnection.run({$edgeId: id, $nodeId: nodeAId});
			this.s_createConnection.run({$edgeId: id, $nodeId: nodeBId});
			this.db.run("COMMIT");
			return id;
		};

		this.loaded = true;
		await this.hooks.call("loaded");
	}

	getBackendVersionNumber() {
		return 3;
	}

	getVersionNumber() {
		const row = this.s_getVersionNumber.get({});
		return row[0];
	}

	async upgradeVersion2to3() {
		this.db.run("ALTER TABLE 'edge' RENAME TO 'node_edge'");
		this.db.run("CREATE TABLE edge (entityid INT PRIMARY KEY, FOREIGN KEY (entityid) REFERENCES entity(entityid) ON DELETE CASCADE)");
		this.db.run("INSERT INTO edge (entityid) SELECT entityid FROM entity WHERE type = 'edge'");
		this.db.run("PRAGMA user_version = 3");
	}

	async getData() {
		// sql.js must close the database before exporting, but we want to export while the database is open.
		// Easy solution: clone the database manually before exporting.
		const clone = new SqlJsMapBackend({buildDatabase: false});
		await clone.load();

		this.db.run("BEGIN EXCLUSIVE TRANSACTION");

		for(const table of ["entity", "property", "node", "edge", "node_edge"]) {
			const statement = this.db.prepare(`SELECT * FROM ${table}`);
			const placeholders = statement.getColumnNames().map(() => "?");
			const sql = `INSERT INTO ${table} VALUES (${placeholders.join(", ")})`;
			while(statement.step()) {
				clone.db.run(sql, statement.get());
			}
		}

		this.db.run("COMMIT");

		return clone.db.export();
	}

	baseCreateEntity(type) {
		this.s_createEntity.run({$type: type});
		return this.db.exec("SELECT last_insert_rowid()")[0].values[0][0];
	}

	async entityExists(entityId) {
		return this.s_entityExists.get({$entityId: entityId}).length > 0;
	}

	async entityValid(entityId) {
		return this.s_entityValid.get({$entityId: entityId}).length > 0;
	}

	async createEntity(type) {
		return this.getEntityRef(this.baseCreateEntity(type));
	}

	async createNode(parentId, nodeType) {
		const nodeRef = this.getNodeRef(this.baseCreateNode(parentId, nodeType));
		await nodeRef.create();
		return nodeRef;
	}

	async createEdge(nodeAId, nodeBId) {
		const edgeRef = this.getEdgeRef(this.baseCreateEdge(nodeAId, nodeBId));
		await edgeRef.create();
		return edgeRef;
	}

	async getNodeType(nodeId) {
		const row = this.s_getNodeType.get({$nodeId: nodeId});
		return (row.length > 0 && row[0]) ? row[0] : null;
	}

	async getNodeParent(nodeId) {
		const row = this.s_getNodeParent.get({$nodeId: nodeId});
		return (row.length > 0 && row[0]) ? this.getNodeRef(row[0]) : null;
	}

	async * getNodeChildren(nodeId) {
		this.s_getNodeChildren.bind({$nodeId: nodeId});
		while(this.s_getNodeChildren.step()) {
			yield this.getNodeRef(this.s_getNodeChildren.get()[0]);
		}
	}

	async removeEntity(entityId) {
		this.s_invalidateEntity.run({$entityId: entityId});
	}

	async unremoveEntity(entityId) {
		this.s_validateEntity.run({$entityId: entityId});
	}

	async getPNumber(entityId, propertyName) {
		return this.s_gpn.get({
			$entityId: entityId,
			$property: propertyName,
		})[0];
	}

	async setPNumber(entityId, propertyName, value) {
		return this.s_spn.run({
			$entityId: entityId,
			$property: propertyName,
			$value: value,
		});
	}

	async getPVector3(entityId, propertyName) {
		const row = this.s_gpv3.get({
			$entityId: entityId,
			$property: propertyName,
		});
		return new Vector3(row[0], row[1], row[2]);
	}

	async setPVector3(entityId, propertyName, vector3) {
		return this.s_spv3.run({
			$entityId: entityId,
			$property: propertyName,
			$x: vector3.x,
			$y: vector3.y,
			$z: vector3.z,
		});
	}

	async getPString(entityId, propertyName) {
		const row = this.s_gps.get({
			$entityId: entityId,
			$property: propertyName,
		});
		return row.length === 0 ? undefined : row[0];
	}

	async setPString(entityId, propertyName, value) {
		return this.s_sps.run({
			$entityId: entityId,
			$property: propertyName,
			$value: value,
		});
	}

	async * getNodesTouchingArea(box, minRadius) {
		this.s_getNodesTouchingArea.bind({$ax: box.a.x, $ay: box.a.y, $az: box.a.z, $bx: box.b.x, $by: box.b.y, $bz: box.b.z, $minRadius: minRadius});
		while(this.s_getNodesTouchingArea.step()) {
			yield this.getNodeRef(this.s_getNodesTouchingArea.get()[0]);
		}
	}

	async * getObjectNodesTouchingArea(box, minRadius) {
		this.s_getObjectNodesTouchingArea.bind({$ax: box.a.x, $ay: box.a.y, $az: box.a.z, $bx: box.b.x, $by: box.b.y, $bz: box.b.z, $minRadius: minRadius});
		while(this.s_getObjectNodesTouchingArea.step()) {
			yield this.getNodeRef(this.s_getObjectNodesTouchingArea.get()[0]);
		}
	}

	async * getNodeEdges(nodeId) {
		this.s_getNodeEdges.bind({$nodeId: nodeId});
		while(this.s_getNodeEdges.step()) {
			yield this.getDirEdgeRef(this.s_getNodeEdges.get()[0], nodeId);
		}
	}

	async * getEdgeNodes(edgeId) {
		this.s_getEdgeNodes.bind({$edgeId: edgeId});
		while(this.s_getEdgeNodes.step()) {
			yield this.getNodeRef(this.s_getEdgeNodes.get()[0]);
		}
	}

	async getEdgeBetween(nodeAId, nodeBId) {
		const row = this.s_getEdgeBetween.get({$nodeAId: nodeAId, $nodeBId: nodeBId});
		return (row.length === 0) ? null : this.getEdgeRef(row[0]);
	}
}

class Brush {
	constructor(context) {
		this.context = context;

		this.size = 1;
		this.maxSize = 20;
	}

	displayButton(button) {
		button.innerText = this.constructor.name;
	}

	displaySidebar(brushBar, container) {
	}

	switchTo() {
		this.lastSizeChange = performance.now();
	}

	getDescription() {
		throw "description not implemented";
	}

	getRadius() {
		return this.size * 15;
	}

	sizeInMeters() {
		return this.context.mapper.unitsToMeters(this.context.pixelsToUnits(this.getRadius()));
	}

	increment() {}

	decrement() {}

	shrink() {
		this.size = Math.max(1, this.size - 1);
		this.lastSizeChange = performance.now();
		this.context.hooks.call("brush_size_change", this);
	}

	enlarge() {
		this.size = Math.min(this.maxSize, this.size + 1);
		this.lastSizeChange = performance.now();
		this.context.hooks.call("brush_size_change", this);
	}

	sizeRecentlyChanged() {
		return performance.now() - this.lastSizeChange < 1000;
	}

	async drawAsCircle(context, position) {
		context.setLineDash([]);

		context.beginPath();
		context.arc(position.x, position.y, this.getRadius(), 0, 2 * Math.PI, false);
		context.strokeStyle = "white";
		context.stroke();

		context.fillStyle = "white";
		context.fillRect(position.x - this.getRadius(), position.y - 16, 2, 32);
		context.fillRect(position.x + this.getRadius(), position.y - 16, 2, 32);
		context.fillRect(position.x - this.getRadius(), position.y - 1, this.getRadius() * 2, 2);

		context.textBaseline = "alphabetic";
		context.font = "16px mono";
		const sizeText = `${Math.floor(this.sizeInMeters() * 2 + 0.5)}m`;
		context.fillText(sizeText, position.x - context.measureText(sizeText).width / 2, position.y - 6);

		context.textBaseline = "top";
		const worldPosition = this.context.canvasPointToMap(position).map(c => this.context.mapper.unitsToMeters(c)).round();
		const positionText = `${worldPosition.x}m, ${worldPosition.y}m, ${this.context.mapper.unitsToMeters(await this.context.getCursorAltitude())}m`;
		context.fillText(positionText, position.x - Math.min(this.getRadius(), context.measureText(positionText).width / 2), position.y + this.getRadius() + 6);
	}

	async draw(context, position) {
		await this.drawAsCircle(context, position);
	}

	async trigger(where, mouseDragEvent) {
	}

	async activate(where) {
	}

	signalLayerChange(layer) {
	}
}

class DragEvent {
	constructor(context, startPoint) {
		this.context = context;
		this.path = new Path(startPoint);
		this.done = false;
		this.hoverSelection = this.context.hoverSelection;
	}

	next(nextPoint) {
		this.path.next(nextPoint);
	}

	end(endPoint) {
		this.path.next(endPoint);
		this.done = true;
	}

	cancel() {}

	async getSelectionParent() {
		return await this.hoverSelection.getParent();
	}
}

/** An Action performed on the map (such as adding a node or changing a node's property).
 * Every action has an opposite action that can be used to create an undo/redo system.
 */
class Action {
	/**
	 * @param context {RenderContext} the context in which this action is performed
	 * @param options A key-value object of various options for the action.
	 */
	constructor(context, options) {
		this.context = context;
		this.options = options;
	}

	/**
	 * Is the action a no-op, based on its options?
	 * @returns {boolean}
	 */
	empty() {
		return false;
	}

	/** Perform the action.
	 * @return {Action} An action that completely undoes the performed action.
	 */
	async perform() {}
}

/** An action composed of several actions. Will handle creating the needed bulk action to undo the actions in order.
 * Options:
 * - actions: An array of actions to perform.
 */
class BulkAction extends Action {
	async perform() {
		const actions = [];

		for(const action of this.options.actions) {
			actions.push(await this.context.performAction(action, false));
		}

		return new BulkAction(this.context, {
			actions: actions.reverse(),
		});
	}

	empty() {
		for(const action of this.options.actions) {
			if(!action.empty()) {
				return false;
			}
		}
		return true;
	}
}

class DrawEvent extends DragEvent {
	constructor(context, startPoint) {
		super(context, startPoint);

		this.undoActions = [];
		this.state = [];
	}

	getFirstState() {
		return this.state.length > 0 ? this.state[0] : undefined;
	}

	getLastState() {
		return this.state.length > 0 ? this.state[this.state.length - 1] : undefined;
	}

	pushState(state) {
		this.state.push(state);
	}

	getUndoAction() {
		return new BulkAction(this.context, {
			actions: this.undoActions.splice(0, this.undoActions.length).reverse(),
		});
	}

	async next(nextPoint) {
		super.next(nextPoint);

		this.undoActions.push(await this.trigger());
	}

	async end(endPoint) {
		super.end(endPoint);

		this.undoActions.push(await this.trigger());

		this.context.pushUndo(this.getUndoAction());
	}

	async trigger() {
		return await this.context.brush.trigger(this);
	}

	cancel() {
		this.end(this.path.lastVertex());
	}
}

class ChangeNameAction extends Action {
	async perform() {
		const oldName = (await this.options.nodeRef.getPString("name")) || "";
		await this.options.nodeRef.setPString("name", this.options.name);
		await this.context.mapper.hooks.call("updateNode", this.options.nodeRef);
		return new ChangeNameAction(this.context, {nodeRef: this.options.nodeRef, name: oldName});
	}

	empty() {
		return false;
	}
}

class NodeCleanupAction extends Action {
	async perform() {
		const toRemove = new Set();
		const mergePairs = [];
		const vertices = await asyncFrom(this.getAllPointVertices());

		let sum = Vector3.ZERO;
		let count = 0;

		for(const vertex of vertices) {
			if(!toRemove.has(vertex.nodeRef.id)) {
				++count;
				sum = sum.add(vertex.point);
				for(const otherVertex of vertices) {
					if(otherVertex.nodeRef.id !== vertex.nodeRef.id && otherVertex.point.subtract(vertex.point).length() < (vertex.radius + otherVertex.radius) / 4) {
						toRemove.add(otherVertex.nodeRef.id);
						mergePairs.push([vertex.nodeRef, otherVertex.nodeRef]);
					}
				}
			}
		}

		let center = Vector3.ZERO;

		if(count > 0) {
			center = sum.divideScalar(count);
		}

		let furthest = center;
		for(const vertex of vertices) {
			if(!toRemove.has(vertex.nodeRef.id)) {
				if(vertex.point.subtract(center).lengthSquared() >= furthest.subtract(center).lengthSquared()) {
					furthest = vertex.point;
				}
			}
		}

		const newEdges = [];

		for(const mergePair of mergePairs) {
			const target = mergePair[0];
			for(const neighbor of await(asyncFrom(mergePair[1].getNeighbors()))) {
				if(target.id !== neighbor.id && !(await this.context.mapper.backend.getEdgeBetween(target.id, neighbor.id))) {
					const edgeRef = await this.context.mapper.backend.createEdge(target.id, neighbor.id);
					newEdges.push(edgeRef);
				}
			}
		}

		const undoNodeAction = await this.context.performAction(new BulkAction(this.context, {actions: [
			new RemoveAction(this.context, {nodeRefs: [...toRemove].map((id) => this.context.mapper.backend.getNodeRef(id))}),
			new SetNodeSpaceAction(this.context, {nodeRef: this.options.nodeRef, center: center, effectiveCenter: center, radius: furthest.subtract(center).length()}),
		]}), false);

		return new BulkAction(this.context, {actions: [undoNodeAction, new RemoveEdgeAction(this.context, {edgeRefs: newEdges})]});
	}

	async * getAllNodes() {
		for await (const nodeRef of this.options.nodeRef.getAllDescendants()) {
			yield nodeRef;
		}
	}

	async * getAllPointVertices() {
		for await (const nodeRef of this.getAllNodes()) {
			if(await nodeRef.getNodeType() === "point") {
				yield {
					nodeRef: nodeRef,
					radius: await nodeRef.getRadius(),
					point: await nodeRef.getCenter(),
				};
			}
		}
	}
}

class UnremoveAction extends Action {
	async perform() {
		await this.context.mapper.unremoveNodes(this.options.nodeRefs);
		return new RemoveAction(this.context, {nodeRefs: this.options.nodeRefs});
	}

	empty() {
		return this.options.nodeRefs.length === 0;
	}
}

class RemoveAction extends Action {
	async perform() {
		const affectedNodeRefs = await this.context.mapper.removeNodes(this.options.nodeRefs);
		return new UnremoveAction(this.context, {nodeRefs: affectedNodeRefs});
	}

	empty() {
		return this.options.nodeRefs.length === 0;
	}
}

class UnremoveEdgeAction extends Action {
	async perform() {
		await this.context.mapper.unremoveEdges(this.options.edgeRefs);
		return new RemoveEdgeAction(this.context, {edgeRefs: this.options.edgeRefs});
	}

	empty() {
		return this.options.edgeRefs.length === 0;
	}
}

class RemoveEdgeAction extends Action {
	async perform() {
		await this.context.mapper.removeEdges(this.options.edgeRefs);
		return new UnremoveEdgeAction(this.context, {edgeRefs: this.options.edgeRefs});
	}

	empty() {
		return this.options.edgeRefs.length === 0;
	}
}

class SetNodeSpaceAction extends Action {
	async perform() {
		const undoAction = new SetNodeSpaceAction(this.context, {
			nodeRef: this.options.nodeRef,
			center: await this.options.nodeRef.getCenter(),
			effectiveCenter: await this.options.nodeRef.getEffectiveCenter(),
			radius: await this.options.nodeRef.getRadius(),
		});

		await this.options.nodeRef.setCenter(this.options.center);
		await this.options.nodeRef.setEffectiveCenter(this.options.effectiveCenter);
		await this.options.nodeRef.setRadius(this.options.radius);

		await this.context.mapper.hooks.call("updateNode", this.options.nodeRef);

		return undoAction;
	}
}

class TranslateAction extends Action {
	async perform() {
		await this.context.mapper.translateNode(this.options.nodeRef, this.options.offset);
		return new TranslateAction(this.context, {
			nodeRef: this.options.nodeRef,
			offset: this.options.offset.multiplyScalar(-1),
		});
	}

	empty() {
		return false;
	}
}

class DrawPathAction extends Action {
	getPathOnMap() {
		return this.context.canvasPathToMap(this.options.path.asMostRecent()).withBisectedLines(this.getRadiusOnMap());
	}

	getRadiusOnMap() {
		return this.context.pixelsToUnits(this.options.radius);
	}

	async perform() {
		const drawEvent = this.options.drawEvent;
		const placedNodes = [];

		const radius = this.getRadiusOnMap();

		/* Get the altitude (Z) we need at a specific point on the map in order to be on top of all other map objects. */
		const getAltitudeAdd = async (point) => {
			// Find the nodeRef being drawn on top currently.
			const closestNodePart = await this.context.getDrawnNodePartAtCanvasPoint(this.context.mapPointToCanvas(point), this.options.layer);
			if(closestNodePart) {
				const closestNodeRef = closestNodePart.nodeRef;
				// There is a node below us.
				const closestParent = await closestNodeRef.getParent();
				// Get it's Z level at that position.
				const closestZ = (await closestNodeRef.getCenter()).z;
				if(closestParent && closestParent.id === this.options.parent.id) {
					// If this map object is the same as what we're drawing, keep the same altitude.
					return closestZ;
				}
				else {
					// If this map object is different, we want to draw above it, so add a bit to the altitude.
					return closestZ + this.context.altitudeIncrement;
				}
			}
			else {
				// Nothing below us, stay at 0 Z.
				return 0;
			}
		};

		// Draw border nodes at a particular travel rotation.
		const drawAtAngle = async (where, angle) => {
			const borderAOffset = new Vector3(Math.cos(angle), -Math.sin(angle), 0).multiplyScalar(radius);
			const borderBOffset = borderAOffset.multiplyScalar(-1);

			let borderAPoint = where.add(borderAOffset);
			borderAPoint = borderAPoint.add(new Vector3(0, 0, await getAltitudeAdd(borderAPoint)));

			let borderBPoint = where.add(borderBOffset);
			borderBPoint = borderBPoint.add(new Vector3(0, 0, await getAltitudeAdd(borderBPoint)));

			const borderA = await this.context.mapper.insertNode(borderAPoint, "point", {
				type: this.options.nodeType,
				radius: 0,
				parent: this.options.parent,
			});

			const borderB = await this.context.mapper.insertNode(borderBPoint, "point", {
				type: this.options.nodeType,
				radius: 0,
				parent: this.options.parent,
			});

			return [borderA, borderB];
		};

		const connectNodes = async (nodesA, nodesB) => {
			const seen = new Set();
			for(const a of nodesA) {
				seen.add(a.id);
				for(const b of nodesB) {
					if(!seen.has(b.id)) {
						await this.context.mapper.backend.createEdge(a.id, b.id);
					}
				}
			}
		};

		const vertices = Array.from(this.getPathOnMap().vertices());

		for(let i = 0; i < vertices.length; i++) {
			const where = vertices[i];
			const wherePixel = this.context.mapPointToCanvas(where);

			const lastState = drawEvent.getLastState();
			const first = lastState === undefined;
			const last = drawEvent.done && i === vertices.length - 1;

			const placedForVertex = [];

			// Calculate
			let dir = Vector3.ZERO;
			let angle = Math.PI / 2;
			let ok = true; // OK to add more nodes, or should we wait instead?
			if(!first) {
				// We've drawn something before, let's find out which way the user is drawing.
				const diff = wherePixel.subtract(lastState.wherePixel);
				if(diff.length() > this.options.radius / 2) {
					// The user has drawn enough, let's go!
					dir = diff.normalize();
					angle = Math.atan2(-dir.y, dir.x) + Math.PI / 2;
				}
				else if(!last) {
					// The user hasn't really moved or stopped drawing, let's not do anything until next time.
					ok = false;
				}
			}

			let pathNode;

			if(ok) {
				if(last || first) {
					// This is the beginning or end of a stroke, draw all four "sides".
					placedForVertex.push(...(await drawAtAngle(where, 0)));
					placedForVertex.push(...(await drawAtAngle(where, Math.PI / 2)));
				}
				else {
					// We're in the middle of a stroke, just continue the path.
					placedForVertex.push(...(await drawAtAngle(where, angle)));
				}

				placedNodes.push(...placedForVertex);

				if(this.options.nodeType.isPath()) {
					pathNode = await this.context.mapper.insertNode(where, "path", {
						type: this.options.nodeType,
						radius: this.options.radius,
						parent: this.options.parent,
					});
					placedNodes.push(pathNode);
				}

				// Record drawing event for calculating the full path.
				drawEvent.pushState({
					where: where,
					wherePixel: wherePixel,
					angle: angle,
					borders: placedForVertex,
					pathNode: pathNode,
				});
			}

			// Connect borders across the drawn area.
			await connectNodes(placedForVertex, placedForVertex);

			// Connect edges to the last drawn position.
			if(lastState !== undefined) {
				await connectNodes(placedForVertex, lastState.borders);

				if(pathNode) {
					await this.context.mapper.backend.createEdge(pathNode.id, lastState.pathNode.id);
				}
			}
		}

		for(const nodeRef of placedNodes) {
			let sum = Vector3.ZERO;
			let count = 0;

			for await (const otherNodeRef of nodeRef.getSelfAndNeighbors()) {
				sum = sum.add(await otherNodeRef.getCenter());
				count += 1;
			}

			const center = sum.divideScalar(count);
			let furthest = center;

			for await (const otherNodeRef of nodeRef.getSelfAndNeighbors()) {
				const point = await otherNodeRef.getCenter();
				if(furthest.subtract(center).lengthSquared() < point.subtract(center).lengthSquared()) {
					furthest = point;
				}
			}

			await nodeRef.setEffectiveCenter(center);
			await nodeRef.setRadius(furthest.subtract(center).length());
			await this.options.parent.setRadius(Math.max(await this.options.parent.getRadius(), await nodeRef.getRadius()));
			await this.context.mapper.hooks.call("updateNode", this.options.parent);
		}

		const undoActions = [];

		if(drawEvent.done) {
			if(this.options.undoParent) {
				placedNodes.push(this.options.parent);
			}

			undoActions.push(await this.context.performAction(new NodeCleanupAction(this.context, {nodeRef: this.options.parent, type: this.options.nodeType}), false));
		}

		undoActions.push(new RemoveAction(this.context, {
			nodeRefs: placedNodes,
		}));

		return new BulkAction(this.context, {actions: undoActions});
	}

	empty() {
		return false;
	}
}

// Autogenerated
const images = {
	grass: {image: new Promise((resolve) => {const image = new Image(); image.src = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAABhGlDQ1BJQ0MgcHJvZmlsZQAAKJF9kT1Iw0AcxV9bpSIVFQuKdMhQnSyIijhqFYpQIdQKrTqYXPoFTRqSFBdHwbXg4Mdi1cHFWVcHV0EQ/ABxdHJSdJES/5cUWsR4cNyPd/ced+8Af73MVLNjHFA1y0gl4kImuyoEXxFCBP3ow6DETH1OFJPwHF/38PH1LsazvM/9OXqUnMkAn0A8y3TDIt4gnt60dM77xGFWlBTic+Ixgy5I/Mh12eU3zgWH/TwzbKRT88RhYqHQxnIbs6KhEk8RRxVVo3x/xmWF8xZntVxlzXvyF4Zy2soy12lGkMAiliBCgIwqSijDQoxWjRQTKdqPe/iHHb9ILplcJTByLKACFZLjB/+D392a+ckJNykUBzpfbPtjBAjuAo2abX8f23bjBAg8A1day1+pAzOfpNdaWvQI6N0GLq5bmrwHXO4AQ0+6ZEiOFKDpz+eB9zP6piwwcAt0r7m9Nfdx+gCkqavkDXBwCIwWKHvd491d7b39e6bZ3w9feXKfrfv3LAAAAAZiS0dEAAAAgAAAGHag/wAAAAlwSFlzAAAuIwAALiMBeKU/dgAAAAd0SU1FB+YMHBERCn0eVFAAAAAZdEVYdENvbW1lbnQAQ3JlYXRlZCB3aXRoIEdJTVBXgQ4XAAAAXklEQVQ4y2NgGAWoYB3Df5xyDXjk4OAZw3+Ga2gKlyDx3xNjyEw0Rb+R+LcxDWDCMMAKif2T4T8DKwMjnH8K0z5MAy7iYDMwMCAZhccAZHADjR/FwMhwi5hwGAX0BQB+bRebyFyPsQAAAABJRU5ErkJggg=="; resolve(image); })},
	forest: {image: new Promise((resolve) => {const image = new Image(); image.src = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAABhGlDQ1BJQ0MgcHJvZmlsZQAAKJF9kT1Iw0AcxV9TRZGKQzuIOmSoThbELxy1CkWoEGqFVh1MLv2CJg1Jiouj4Fpw8GOx6uDirKuDqyAIfoA4OjkpukiJ/0sKLWI8OO7Hu3uPu3eAUC8zzeoYAzTdNlOJuJjJropdrwhhEGFEMSUzy5iTpCR8x9c9Any9i/Es/3N/jl41ZzEgIBLPMsO0iTeIpzdtg/M+cYQVZZX4nHjUpAsSP3Jd8fiNc8FlgWdGzHRqnjhCLBbaWGljVjQ14kniqKrplC9kPFY5b3HWylXWvCd/YSinryxzneYQEljEEiSIUFBFCWXYiNGqk2IhRftxH/+A65fIpZCrBEaOBVSgQXb94H/wu1srPzHuJYXiQOeL43wMA127QKPmON/HjtM4AYLPwJXe8lfqwMwn6bWWFj0C+raBi+uWpuwBlztA/5Mhm7IrBWkK+TzwfkbflAXCt0DPmtdbcx+nD0CaukreAAeHwEiBstd93t3d3tu/Z5r9/QDeinLSpG44JAAAAAZiS0dEAKwAjwAApv2VVQAAAAlwSFlzAAAuIwAALiMBeKU/dgAAAAd0SU1FB+YMGxMlNncIN/cAAAAZdEVYdENvbW1lbnQAQ3JlYXRlZCB3aXRoIEdJTVBXgQ4XAAABbUlEQVQ4y6WTPUuCURiGr8e3xPyM6AMlkCCComiIGnLoF7Q4lUPQ0tLS0ODYUEu/oYi2WvwPBhYUQV+E0FBQOahpb6R9+b6nQfNNzDB6pnOe+5zr8NyHW1jhX2Wr2QVQaChA/R3gROECeoEuQFC+Kd8fAH4gC6SBp7Kix3XGRseaBFwDOuABDKCl3D4+PaZ/or8JgImEhkKynp6GEhLpiciXlGnLlBeuem+qgHBfmMRFAk3eABjID1QP6fe6ogOFBwiiCFigKiB2HQMg+zIMQLIjaT1zA2iAWRmz2OgbgYD7AIBWs5Uag90Vg72WP3WANWNGue13bDv9KufIWYIDyFcul4As8iPAZU8xX7yVwoffMg7gCll9mGUXBwvmgkTbo1Wp5TtgydgTgKPuUTk826oZTWHjJL3I+fg+mqnBY7kvzWZhx9um3g0Pc4W0NM5Cg4q+LivBYDM4KL+HqUGNdG6Qep4kfhmv0+S/cf4ExLVoxbgQ0MUAAAAASUVORK5CYII="; resolve(image); })},
	rocks: {image: new Promise((resolve) => {const image = new Image(); image.src = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAABhWlDQ1BJQ0MgcHJvZmlsZQAAKJF9kT1Iw1AUhU9TiyIVBzuIKGSogmBBVMRRq1CECqFWaNXB5KV/0KQhSXFxFFwLDv4sVh1cnHV1cBUEwR8QRycnRRcp8b6k0CLGC4/3cd49h/fuA4R6mWlWxzig6baZSsTFTHZV7HxFGEMIIIRRmVnGnCQl4Vtf99RJdRfjWf59f1aPmrMYEBCJZ5lh2sQbxNObtsF5nzjCirJKfE48ZtIFiR+5rnj8xrngssAzI2Y6NU8cIRYLbay0MSuaGvEUcVTVdMoXMh6rnLc4a+Uqa96TvzCc01eWuU5rEAksYgkSRCioooQybMRo10mxkKLzuI9/wPVL5FLIVQIjxwIq0CC7fvA/+D1bKz854SWF40DoxXE+hoHOXaBRc5zvY8dpnADBZ+BKb/krdWDmk/RaS4seAb3bwMV1S1P2gMsdoP/JkE3ZlYK0hHweeD+jb8oCfbdA95o3t+Y5Th+ANM0qeQMcHAIjBcpe93l3V/vc/u1pzu8HS0Fyl1X9M4UAAAAGYktHRAB3AHcAdy1uHeoAAAAJcEhZcwAALiMAAC4jAXilP3YAAAAHdElNRQfmDB0BBhQmCCmwAAAAGXRFWHRDb21tZW50AENyZWF0ZWQgd2l0aCBHSU1QV4EOFwAAAHpJREFUOMvtkC0OwCAMRj9LMCQcAI0iAc6AAcMNsCjurzo10Y1lP2ZZss+VvL62AJ9L751OoZzzFBpjEABorY8lrTUCgJQSg2KMrJZS7iVKKfZYSqHLtznnpvB28rsJITzfZv00Y8x9Sa2VNQkhrkustVPYe0/4AwBYAC1RHrJJM5uZAAAAAElFTkSuQmCC"; resolve(image); })},
	water: {image: new Promise((resolve) => {const image = new Image(); image.src = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAABhGlDQ1BJQ0MgcHJvZmlsZQAAKJF9kT1Iw0AcxV9bpSIVByv4NWSoThZERTpqFYpQIdQKrTqYXPoFTRqSFBdHwbXg4Mdi1cHFWVcHV0EQ/ABxdHJSdJES/5cUWsR4cNyPd/ced+8Af73MVLNjAlA1y0gl4kImuyoEXxHCMPoRw6DETH1OFJPwHF/38PH1LsqzvM/9OXqUnMkAn0A8y3TDIt4gntm0dM77xGFWlBTic+Jxgy5I/Mh12eU3zgWH/TwzbKRT88RhYqHQxnIbs6KhEk8TRxRVo3x/xmWF8xZntVxlzXvyF4Zy2soy12mOIIFFLEGEABlVlFCGhSitGikmUrQf9/APOX6RXDK5SmDkWEAFKiTHD/4Hv7s181OTblIoDnS+2PbHKBDcBRo12/4+tu3GCRB4Bq60lr9SB2KfpNdaWuQI6N0GLq5bmrwHXO4AA0+6ZEiOFKDpz+eB9zP6pizQdwt0r7m9Nfdx+gCkqavkDXBwCIwVKHvd491d7b39e6bZ3w/PzHLM/vcV3AAAAAZiS0dEAKwAjwAApv2VVQAAAAlwSFlzAAAuIwAALiMBeKU/dgAAAAd0SU1FB+YMGxU5D8r3nhAAAAAZdEVYdENvbW1lbnQAQ3JlYXRlZCB3aXRoIEdJTVBXgQ4XAAABGklEQVQ4y9WTTSuEYRSGr2flY2qyU6NZWCg1GyRFVoxZvVLjI01pVvJRNiJlYe5Ss5DU7DRJ2Wg2ShFK+Af+wmSS8gd81XQs3poxhddYce+ec57nOdd9Tgf+vdzHw+K+6e0V9hacAJp6TZktuC/BcQG8cSgV4Szr52u0dGCV4ETWFEmYNk6qsYF5U0O36VOM2PQXiXotACQ3Tdfn0ByCh8sq6mTWFOuCmwu4K0LCg/ycU80HjT2ml1v/UajPNDUDz08QicJOyn1PGV8xpbZ/bqV91L/rAj3GTF4SymUYHIL1uNPyoSmQCGBktZYonTOF+3/f8GDN7prGMvVVqPSgddj0eOX7SudM4RZoi8LpkT+Jjk4orDn9vWV6B1XjXxUUADdLAAAAAElFTkSuQmCC"; resolve(image); })},
};

const tileSize = 16;

const fillStyles = {};

class NodeRender {
	constructor(context, nodeRef) {
		this.context = context;
		this.nodeRef = nodeRef;
		this.renders = {};
	}

	static async getNodeTypeFillStyle(context, nodeType, backgroundType) {
		const id = nodeType.id + ":" + (backgroundType ? backgroundType.id : "");
		let fillStyle = fillStyles[id];

		if(fillStyle === undefined) {
			const image = document.createElement("canvas");
			image.width = image.height = tileSize;

			const c = image.getContext("2d");

			if(backgroundType) {
				c.fillStyle = backgroundType.getColor();
			}
			else {
				c.fillStyle = nodeType.getColor();
			}

			c.fillRect(0, 0, tileSize, tileSize);

			const imageName = await nodeType.getImageName();
			if(imageName) {
				c.drawImage(await images[imageName].image, 0, 0);
			}

			fillStyles[id] = fillStyle = context.createPattern(image, "repeat");
		}

		return fillStyle;
	}

	async getLayers(zoom) {
		let render = this.renders[zoom];
		if(render === undefined) {
			render = [];

			const drawType = (await this.nodeRef.getLayer()).getDrawType();
			const areaDrawType = drawType === "area";

			if(this.context.unitsToPixels(await this.nodeRef.getRadius()) >= 1) {
				if(areaDrawType) {
					render = this.renderArea();
				}
				else {
					render = this.renderBorder();
				}
			}

			this.renders[zoom] = render;
		}
		return render;
	}

	async renderBorder() {
		const render = [];
		const toRender = [];

		let topLeftCorner = new Vector3(Infinity, Infinity, Infinity);
		let bottomRightCorner = new Vector3(-Infinity, -Infinity, -Infinity);

		for await (const childNodeRef of this.nodeRef.getChildren()) {
			const radiusInPixels = this.context.unitsToPixels(await childNodeRef.getRadius());
			const radiusVector = Vector3.UNIT.multiplyScalar(radiusInPixels).noZ();
			const point = (await childNodeRef.getEffectiveCenter()).map((c) => this.context.unitsToPixels(c)).noZ();

			topLeftCorner = Vector3.min(topLeftCorner, point.subtract(radiusVector));
			bottomRightCorner = Vector3.max(bottomRightCorner, point.add(radiusVector));

			toRender.push({
				nodeRef: childNodeRef,
				layer: await childNodeRef.getLayer(),
				absolutePoint: point,
				radius: radiusInPixels,
			});
		}

		// Align the node render to the tile grid.
		topLeftCorner = topLeftCorner.map(Math.floor).map((c) => c - c % tileSize);
		bottomRightCorner = bottomRightCorner.map(Math.ceil);

		const lines = [];

		for(const part of toRender) {
			part.point = part.absolutePoint.subtract(topLeftCorner);
		}

		for(const part of toRender) {
			const pointAt = r => (new Vector3(Math.cos(r), Math.sin(r), 0)).multiplyScalar(part.radius).add(part.point);
			const connect = (previous, next) => {
				const line = new Line3(previous, next);

				for(const otherPart of toRender) {
					if(otherPart === part) {
						continue;
					}

					let aIn;
					let bIn;

					do {
						aIn = otherPart.point.subtract(line.a).length() < otherPart.radius - 1;
						bIn = otherPart.point.subtract(line.b).length() < otherPart.radius - 1;

						if(aIn && bIn) {
							return;
						}

						if(aIn) {
							line.a = line.a.add(line.b).divideScalar(2);
						}
						else if(bIn) {
							line.b = line.a.add(line.b).divideScalar(2);
						}
					} while(aIn || bIn);
				}

				lines.push({
					line: line.map(v => v.map(c => Math.floor(c + 0.5))),
					part: part,
				});
			};

			let previousPoint = pointAt(0);

			const increment = 8 / part.radius;

			for(let r = increment; r < Math.PI * 2; r += increment) {
				const currentPoint = pointAt(r);
				connect(previousPoint, currentPoint);
				previousPoint = currentPoint;
			}

			connect(previousPoint, pointAt(0));
		}

		const miniCanvasSize = 2048;
		const totalCanvasSize = new Vector3(bottomRightCorner.x - topLeftCorner.x, bottomRightCorner.y - topLeftCorner.y, 0);

		const miniCanvasLimit = totalCanvasSize.divideScalar(miniCanvasSize).map(Math.floor);
		for(let x = 0; x <= miniCanvasLimit.x; x++) {
			for(let y = 0; y <= miniCanvasLimit.y; y++) {
				const offset = new Vector3(x, y, 0).multiplyScalar(miniCanvasSize);

				const width = Math.min(miniCanvasSize, totalCanvasSize.x - offset.x);
				const height = Math.min(miniCanvasSize, totalCanvasSize.y - offset.y);

				let canvas;

				const canvasFunction = async () => {
					if(canvas) {
						return canvas;
					}

					canvas = document.createElement("canvas");
					canvas.width = width;
					canvas.height = height;

					const c = canvas.getContext("2d");

					c.strokeStyle = (await this.nodeRef.getType()).getColor();

					for(const line of lines) {
						const a = line.line.a.subtract(offset);
						const b = line.line.b.subtract(offset);
						c.beginPath();
						c.moveTo(a.x, a.y);
						c.lineTo(b.x, b.y);
						c.stroke();
					}

					return canvas;
				};

				render.push({
					nodeRender: this,
					corner: topLeftCorner.add(offset),
					z: 0,
					canvas: canvasFunction,
					width: width,
					height: height,
					focusTiles: {},
					parts: toRender,
				});
			}
		}

		return render;
	}

	async renderArea() {
		const fakeCanvas = document.createElement("canvas");
		fakeCanvas.width = tileSize;
		fakeCanvas.height = tileSize;

		const fakeContext = fakeCanvas.getContext("2d");

		const render = [];

		const layers = {};

		for await(const childNodeRef of this.nodeRef.getChildren()) {
			const z = (await childNodeRef.getCenter()).z;
			let layer = layers[z];
			if(layer === undefined) {
				layers[z] = layer = [];
			}
			layer.push(childNodeRef);
		}

		const receivesBackground = (await this.nodeRef.getType()).receivesBackground();

		for(const z in layers) {
			const children = layers[z];
			const toRender = [];

			let topLeftCorner = new Vector3(Infinity, Infinity, Infinity);
			let bottomRightCorner = new Vector3(-Infinity, -Infinity, -Infinity);

			const focusTiles = {};

			for(const childNodeRef of children) {
				const radiusInPixels = this.context.unitsToPixels(await childNodeRef.getRadius());
				const radiusVector = Vector3.UNIT.multiplyScalar(radiusInPixels).noZ();
				const point = (await childNodeRef.getEffectiveCenter()).map((c) => this.context.unitsToPixels(c)).noZ();

				topLeftCorner = Vector3.min(topLeftCorner, point.subtract(radiusVector));
				bottomRightCorner = Vector3.max(bottomRightCorner, point.add(radiusVector));

				const backgroundNodeRef = receivesBackground ? await this.context.getBackgroundNode(childNodeRef) : null;

				let fillStyle;

				if(backgroundNodeRef) {
					fillStyle = await NodeRender.getNodeTypeFillStyle(fakeContext, await this.nodeRef.getType(), await backgroundNodeRef.getType());
				}
				else {
					fillStyle = await NodeRender.getNodeTypeFillStyle(fakeContext, await this.nodeRef.getType());
				}

				toRender.push({
					nodeRef: childNodeRef,
					backgroundNodeRef: backgroundNodeRef,
					fillStyle: fillStyle,
					layer: await childNodeRef.getLayer(),
					absolutePoint: point,
					radius: radiusInPixels,
				});
			}

			// Align the node render to the tile grid.
			topLeftCorner = topLeftCorner.map(Math.floor).map((c) => c - c % tileSize);
			bottomRightCorner = bottomRightCorner.map(Math.ceil);

			for(const part of toRender) {
				part.point = part.absolutePoint.subtract(topLeftCorner);

				/* Calculate all potential focus tiles for this part.
				* Potential focus tiles lie along the outer radius of the part. */
				for(let r = 0; r < Math.PI * 2; r += 8 / part.radius) {
					const pos = (new Vector3(Math.cos(r), Math.sin(r), 0)).multiplyScalar(part.radius - 1).add(part.absolutePoint);
					const tilePos = pos.divideScalar(tileSize).map(Math.floor);
					let tilesX = focusTiles[tilePos.x];
					if(tilesX === undefined) {
						tilesX = focusTiles[tilePos.x] = {};
					}

					const absolutePoint = tilePos.multiplyScalar(tileSize);

					tilesX[tilePos.y] = {
						absolutePoint: absolutePoint,
						centerPoint: absolutePoint.add(new Vector3(tileSize / 2, tileSize / 2, 0)),
						part: part,
						layer: await part.nodeRef.getLayer(),
						nodeType: await part.nodeRef.getType(),
					};
				}
			}

			const focusTileEliminationDistance = tileSize * 2;

			/* Loop through all focus tiles and delete those that fall fully within another part;
			* they would certainly not be borders. */
			for(const tX in focusTiles) {
				const focusTilesX = focusTiles[tX];
				for(const tY in focusTilesX) {
					const tile = focusTilesX[tY];
					const point = tile.centerPoint;
					for(const part of toRender) {
						if(part.absolutePoint.subtract(point).length() < part.radius - focusTileEliminationDistance) {
							delete focusTilesX[tY];
							break;
						}
					}
				}
			}

			const miniCanvasSize = 2048;
			const totalCanvasSize = new Vector3(bottomRightCorner.x - topLeftCorner.x, bottomRightCorner.y - topLeftCorner.y, 0);
			if(totalCanvasSize.x === 0 || totalCanvasSize.y === 0) {
				continue;
			}

			const miniCanvasLimit = totalCanvasSize.divideScalar(miniCanvasSize).map(Math.floor);
			for(let x = 0; x <= miniCanvasLimit.x; x++) {
				for(let y = 0; y <= miniCanvasLimit.y; y++) {
					const offset = new Vector3(x, y, 0).multiplyScalar(miniCanvasSize);

					const width = Math.min(miniCanvasSize, totalCanvasSize.x - offset.x);
					const height = Math.min(miniCanvasSize, totalCanvasSize.y - offset.y);

					let canvas;

					const canvasFunction = async () => {
						if(canvas) {
							return canvas;
						}

						canvas = document.createElement("canvas");
						canvas.width = width;
						canvas.height = height;

						const c = canvas.getContext("2d");

						for(const part of toRender) {
							c.fillStyle = part.fillStyle;

							const point = part.point.subtract(offset);
							c.beginPath();
							c.arc(point.x, point.y, part.radius, 0, 2 * Math.PI, false);
							c.fill();
						}

						return canvas;
					};

					render.push({
						nodeRender: this,
						corner: topLeftCorner.add(offset),
						z: z,
						canvas: canvasFunction,
						width: width,
						height: height,
						focusTiles: focusTiles,
						parts: toRender,
					});
				}
			}
		}

		return render;
	}
}

class AddBrush extends Brush {
	constructor(context) {
		super(context);

		this.nodeTypeIndex = 0;
		this.lastTypeChange = 0;

		this.hooks = new HookContainer();

		this.nodeTypes = this.originalNodeTypes = Array.from(this.context.mapper.backend.nodeTypeRegistry.getTypes());
		this.setNodeTypeIndex(0);

		const reset = (layer) => {
			this.nodeTypes = this.originalNodeTypes.filter((nodeType) => nodeType.getLayer() === layer.getType());
			this.setNodeTypeIndex(0);
		};

		this.hooks.add("current_layer_change", (layer) => reset(layer));
	}

	displayButton(button) {
		button.innerText = "(A)dd";
		button.title = "Add Objects";
	}

	async displaySidebar(brushbar, container) {
		const make = async (layer) => {
			container.innerHTML = "";

			const list = document.createElement("ul");
			list.setAttribute("class", "mapper1024_add_brush_strip");
			container.appendChild(list);

			for(const nodeType of this.nodeTypes) {
				if(nodeType.getLayer() === layer.getType()) {
					const index = this.nodeTypes.indexOf(nodeType);

					const li = document.createElement("li");
					list.appendChild(li);

					const button = document.createElement("canvas");
					li.appendChild(button);

					button.width = brushbar.size.x - 8;
					button.height = brushbar.size.x - 8;

					button.title = nodeType.id;

					const c = button.getContext("2d");

					for(const fillStyle of [nodeType.getColor(), await NodeRender.getNodeTypeFillStyle(c, nodeType)]) {
						c.fillStyle = fillStyle;

						if(nodeType.getScale() === "explicit") {
							c.beginPath();
							c.arc(button.width / 2, button.height / 2, Math.min(button.height, button.width) / 2, 0, 2 * Math.PI, false);
							c.fill();
						}
						else {
							c.fillRect(0, 0, button.width, button.height);
						}
					}

					c.textBaseline = "top";
					c.font = "12px sans";

					const text = nodeType.id;
					const firstMeasure = c.measureText(text);

					c.font = `${button.width / firstMeasure.width * 12}px sans`;
					const measure = c.measureText(text);
					const height = Math.abs(measure.actualBoundingBoxAscent) + Math.abs(measure.actualBoundingBoxDescent);
					c.globalAlpha = 0.25;
					c.fillStyle = "black";
					c.fillRect(0, 0, measure.width, height);
					c.globalAlpha = 1;
					c.fillStyle = "white";
					c.fillText(text, 0, 0);

					button.onclick = () => {
						this.setNodeTypeIndex(index);
						this.context.focus();
					};

					const update = () => {
						if(this.nodeTypeIndex === index) {
							button.style.border = "3px dotted black";
						}
						else {
							button.style.border = "0";
						}
					};

					update();

					this.hooks.add("type_changed", update);
				}
			}
		};

		await make(this.context.getCurrentLayer());
		this.hooks.add("current_layer_change", async (layer) => await make(layer));
	}

	signalLayerChange(layer) {
		this.hooks.call("current_layer_change", layer);
	}

	setNodeTypeIndex(index) {
		this.nodeTypeIndex = index;
		this.wrapIndex();
		this.lastTypeChange = performance.now();
		this.hooks.call("type_changed");
		this.context.requestRedraw();
	}

	getDescription() {
		return `Place ${this.getNodeType().getDescription()} (radius ${this.sizeInMeters()}m)`;
	}

	getNodeType() {
		return this.nodeTypes[this.nodeTypeIndex];
	}

	increment() {
		this.setNodeTypeIndex(this.nodeTypeIndex - 1);
	}

	decrement() {
		this.setNodeTypeIndex(this.nodeTypeIndex + 1);
	}

	wrapIndex() {
		const len = this.nodeTypes.length;
		this.nodeTypeIndex = (len == 0) ? -1 : mod(this.nodeTypeIndex, len);
	}

	typeRecentlyChanged() {
		return performance.now() - this.lastTypeChange < 3000;
	}

	async draw(context, position) {
		await super.draw(context, position);

		if((this.typeRecentlyChanged() || this.context.isKeyDown("q")) && this.nodeTypes.length > 0) {
			const radius = Math.min(4, Math.ceil(this.nodeTypes.length / 2));
			for(let i = -radius; i <= radius; i++) {
				const type = this.nodeTypes[mod(this.nodeTypeIndex - i, this.nodeTypes.length)];
				const text = type.getDescription();
				context.font = (i === 0) ? "bold 16px sans" : `${16 - Math.abs(i)}px sans`;
				context.fillText(text, position.x - this.getRadius() - context.measureText(text).width - 4, position.y + 4 + (-i) * 14);
			}
		}
	}

	async trigger(drawEvent) {
		const drawPathActionOptions = {
			path: drawEvent.path,
			radius: this.getRadius(),
			nodeType: this.getNodeType(),
			drawEvent: drawEvent,
			parent: this.parentNode,
			undoParent: this.undoParent,
			layer: this.context.getCurrentLayer(),
		};

		return await this.context.performAction(new DrawPathAction(this.context, drawPathActionOptions));
	}

	async activate(where) {
		const mouseDragEvent = new DrawEvent(this.context, where);

		const selectionParent = await mouseDragEvent.getSelectionParent();
		if(selectionParent && (await selectionParent.getType()).id === this.getNodeType().id) {
			this.parentNode = selectionParent;
			this.undoParent = false;
		}
		else {
			this.parentNode = await this.context.mapper.insertNode(this.context.canvasPointToMap(where), "object", {
				type: this.getNodeType(),
				radius: 0,
			});
			this.undoParent = true;
		}

		return mouseDragEvent;
	}
}

class Selection {
	constructor(context, nodeIds) {
		this.context = context;
		this.originIds = new Set(nodeIds);
		this.parentNodeIds = new Set();
		this.selectedNodeIds = new Set(this.originIds);
		this.childNodeIds = new Set();
		this.siblingNodeIds = new Set();
		this.directSelectedNodeIds = new Set();
	}

	static async fromNodeIds(context, nodeIds) {
		const selection = new Selection(context, nodeIds);
		await selection.update();
		return selection;
	}

	static async fromNodeRefs(context, nodeRefs) {
		return await Selection.fromNodeIds(context, nodeRefs.map((nodeRef) => nodeRef.id));
	}

	async joinWith(other) {
		return Selection.fromNodeRefs(this.context, [...this.getOrigins(), ...other.getOrigins()]);
	}

	async update() {
		const selectedNodeIds = new Set(this.originIds);
		const parentNodeIds = new Set();
		const childNodeIds = new Set();
		const siblingNodeIds = new Set();
		const directSelectedNodeIds = new Set(this.originIds);

		for(const nodeRef of this.getOrigins()) {
			for await (const childNodeRef of nodeRef.getAllDescendants()) {
				selectedNodeIds.add(childNodeRef.id);
				directSelectedNodeIds.add(childNodeRef.id);
				childNodeIds.add(childNodeRef.id);
			}

			const parent = await nodeRef.getParent();
			if(parent) {
				selectedNodeIds.add(parent.id);
				parentNodeIds.add(parent.id);
				directSelectedNodeIds.add(parent.id);
				for await (const siblingNodeRef of parent.getAllDescendants()) {
					siblingNodeIds.add(siblingNodeRef.id);
					selectedNodeIds.add(siblingNodeRef.id);
				}
			}
		}

		this.originIds.forEach((id) => siblingNodeIds.delete(id));
		parentNodeIds.forEach((id) => siblingNodeIds.delete(id));
		childNodeIds.forEach((id) => siblingNodeIds.delete(id));

		this.parentNodeIds = parentNodeIds;
		this.selectedNodeIds = selectedNodeIds;
		this.childNodeIds = childNodeIds;
		this.siblingNodeIds = siblingNodeIds;
		this.directSelectedNodeIds = directSelectedNodeIds;
	}

	hasNodeId(nodeId) {
		return this.selectedNodeIds.has(nodeId);
	}

	hasNodeRef(nodeRef) {
		return this.selectedNodeIds.has(nodeRef.id);
	}

	nodeRefIsOrigin(nodeRef) {
		return this.originIds.has(nodeRef.id);
	}

	nodeRefIsParent(nodeRef) {
		return this.parentNodeIds.has(nodeRef.id);
	}

	nodeRefIsChild(nodeRef) {
		return this.childNodeIds.has(nodeRef.id);
	}

	nodeRefIsSibling(nodeRef) {
		return this.siblingNodeIds.has(nodeRef.id);
	}

	* getOrigins() {
		for(const originId of this.originIds) {
			yield this.context.mapper.backend.getNodeRef(originId);
		}
	}

	exists() {
		return this.originIds.size > 0;
	}

	contains(other) {
		for(const nodeId of other.directSelectedNodeIds) {
			if(!this.directSelectedNodeIds.has(nodeId)) {
				return false;
			}
		}
		return true;
	}

	async getParent() {
		if(this.exists()) {
			for(const origin of this.getOrigins()) {
				const parent = await origin.getParent();
				if(parent && !(await origin.hasChildren())) {
					return parent;
				}
				else {
					return origin;
				}
			}
		}

		return null;
	}
}

class DeleteBrush extends Brush {
	getDescription() {
		return `Delete (radius ${this.sizeInMeters()}m)`;
	}

	displayButton(button) {
		button.innerText = "(D)elete";
		button.title = "Delete Objects";
	}

	async activate(where) {
		return new DrawEvent(this.context, where);
	}

	async * getNodesInBrush(brushPosition) {
		for await (const nodeRef of this.context.drawnNodes()) {
			if((await nodeRef.getLayer()).id === this.context.getCurrentLayer().id) {
				if(this.context.mapPointToCanvas((await nodeRef.getEffectiveCenter())).subtract(brushPosition).length() <= this.getRadius() && !(await nodeRef.hasChildren())) {
					yield nodeRef;
				}
			}
		}
	}

	async draw(context, position) {
		await this.drawAsCircle(context, position);
	}

	async triggerAtPosition(brushPosition) {
		let toRemove;

		if(this.context.isKeyDown("Shift")) {
			const selection = await Selection.fromNodeIds(this.context, this.context.hoverSelection.parentNodeIds);
			toRemove = Array.from(selection.getOrigins());
		}
		else {
			toRemove = await asyncFrom(this.getNodesInBrush(brushPosition));
		}

		return new RemoveAction(this.context, {nodeRefs: toRemove});
	}

	async triggerOnPath(path) {
		const actions = [];
		for(const vertex of path.vertices()) {
			actions.push(await this.triggerAtPosition(vertex));
		}
		return new BulkAction(this.context, {actions: actions});
	}

	async trigger(drawEvent) {
		const action = await this.triggerOnPath(drawEvent.path.asMostRecent());
		const undoAction = await this.context.performAction(action);
		return undoAction;
	}
}

class DistancePegBrush extends Brush {
	constructor(context, n) {
		super(context);
		this.n = n;
	}

	displayButton(button) {
		button.innerText = `Peg (${this.n})`;
		button.title = this.getDescription();
	}

	getDescription() {
		return `Distance Peg (${this.n})`;
	}

	async draw(context, position) {
		context.beginPath();
		context.arc(position.x, position.y, 4, 0, 2 * Math.PI, false);
		context.fillStyle = "white";
		context.fill();

		context.textBaseline = "alphabetic";
		context.font = "16px mono";
		const sizeText = `Placing Distance Peg ${this.n}`;
		context.fillText(sizeText, position.x - context.measureText(sizeText).width / 2, position.y - 16);

		context.textBaseline = "top";
		const worldPosition = this.context.canvasPointToMap(position).map(c => this.context.mapper.unitsToMeters(c)).round();
		const positionText = `${worldPosition.x}m, ${worldPosition.y}m, ${this.context.mapper.unitsToMeters(await this.context.getCursorAltitude())}m`;
		context.fillText(positionText, position.x - context.measureText(positionText).width / 2, position.y + 16);
	}

	async activate(where) {
		this.context.distanceMarkers[this.n] = this.context.canvasPointToMap(where);
	}
}

class TranslateEvent extends DragEvent {
	constructor(context, startPoint, nodeRefs) {
		super(context, startPoint);

		this.nodeRefs = nodeRefs;

		this.undoActions = [];
	}

	getUndoAction() {
		return new BulkAction(this.context, {
			actions: this.undoActions.splice(0, this.undoActions.length).reverse(),
		});
	}

	async next(nextPoint) {
		super.next(nextPoint);

		const offset = this.context.canvasPathToMap(this.path).lastLine().vector();

		for(const nodeRef of this.nodeRefs) {
			this.undoActions.push(await this.context.performAction(new TranslateAction(this.context, {
				nodeRef: nodeRef,
				offset: offset,
			}), false));
		}
	}

	async end(endPoint) {
		this.next(endPoint);

		this.context.pushUndo(this.getUndoAction());
	}

	cancel() {
		this.context.performAction(this.getUndoAction(), false);
	}
}

class SelectBrush extends Brush {
	constructor(context) {
		super(context);
	}

	displayButton(button) {
		button.innerText = "(S)elect";
		button.title = "Select Objects";
	}

	getDescription() {
		return "Select/Move";
	}

	async draw(context, position) {
	}

	async activate(where) {
		const oldSelectedIds = this.context.selection.parentNodeIds;

		if(!this.context.hoveringOverSelection()) {
			if(this.context.hoverSelection.exists()) {
				const newSelection = await Selection.fromNodeIds(this.context, this.context.hoverSelection.parentNodeIds);

				if(newSelection !== null) {
					if(this.context.isKeyDown("Control")) {
						this.context.selection = await this.context.selection.joinWith(newSelection);
					}
					else {
						this.context.selection = newSelection;
					}
				}
			}
			else {
				this.context.selection = new Selection(this.context, []);
			}
		}

		let ret = undefined;

		if(this.context.hoveringOverSelection()) {
			ret = new TranslateEvent(this.context, where, Array.from(this.context.selection.getOrigins()));
		}
		else {
			this.context.selection = new Selection(this, []);
		}

		const newSelectedIds = this.context.selection.parentNodeIds;

		for(const nodeId of oldSelectedIds) {
			if(!newSelectedIds.has(nodeId)) {
				this.context.recalculateNodesSelected([this.context.mapper.backend.getNodeRef(nodeId)]);
			}
		}

		for(const nodeId of newSelectedIds) {
			if(!oldSelectedIds.has(nodeId)) {
				this.context.recalculateNodesSelected([this.context.mapper.backend.getNodeRef(nodeId)]);
			}
		}

		return ret;
	}
}

class PanEvent extends DragEvent {
	next(nextPoint) {
		super.next(nextPoint);
		this.context.setScrollOffset(this.context.scrollOffset.subtract(this.path.lastLine().vector()));
	}
}

class Brushbar {
	constructor(context) {
		this.context = context;

		this.targetWidth = 64;
		this.hooks = new HookContainer();

		this.element = document.createElement("div");
		this.element.setAttribute("class", "mapper1024_brush_bar");
		this.element.style.position = "absolute";
		this.context.parent.appendChild(this.element);

		const title = document.createElement("span");
		title.innerText = "Brush";
		this.element.appendChild(title);
		this.element.appendChild(document.createElement("hr"));

		const size = document.createElement("span");
		this.element.appendChild(size);

		const updateSize = (brush) => {
			if(brush === this.context.brush) {
				size.innerText = `Radius ${Math.floor(brush.sizeInMeters() + 0.5)}m\n1px = ${this.context.mapper.unitsToMeters(this.context.pixelsToUnits(1)).toFixed(2)}m`;
			}
		};

		updateSize(this.context.brush);

		this.element.appendChild(document.createElement("br"));

		this.context.hooks.add("brush_size_change", updateSize);
		this.context.hooks.add("changed_brush", updateSize);
		this.context.hooks.add("changed_zoom", () => updateSize(this.context.brush));

		const sizeUp = document.createElement("button");
		sizeUp.setAttribute("class", "mapper1024_brush_size_button");
		sizeUp.innerText = "+";
		sizeUp.onclick = () => {
			this.context.brush.enlarge();
			this.context.requestRedraw();
			this.context.focus();
		};
		this.element.appendChild(sizeUp);

		const sizeDown = document.createElement("button");
		sizeDown.setAttribute("class", "mapper1024_brush_size_button");
		sizeDown.innerText = "-";
		sizeDown.onclick = () => {
			this.context.brush.shrink();
			this.context.requestRedraw();
			this.context.focus();
		};
		this.element.appendChild(sizeDown);

		this.element.appendChild(document.createElement("hr"));

		const brushButtonContainer = document.createElement("div");
		brushButtonContainer.setAttribute("class", "mapper1024_brush_button_container");
		this.element.appendChild(brushButtonContainer);

		const brushButton = (brush) => {
			const button = document.createElement("button");
			button.setAttribute("class", "mapper1024_brush_button");
			brush.displayButton(button);
			button.onclick = () => {
				this.context.changeBrush(brush);
				this.context.focus();
			};

			this.context.hooks.add("changed_brush", (newBrush) => {
				button.style["font-weight"] = brush === newBrush ? "bold" : "normal";
			});

			return button;
		};

		for(const brushName in this.context.brushes) {
			const button = brushButton(this.context.brushes[brushName]);
			brushButtonContainer.appendChild(button);
		}

		this.element.appendChild(document.createElement("hr"));

		const layerButtonContainer = document.createElement("div");
		layerButtonContainer.setAttribute("class", "mapper1024_brush_button_container");
		this.element.appendChild(layerButtonContainer);

		const layerButton = (layer) => {
			const button = document.createElement("button");
			button.setAttribute("class", "mapper1024_brush_button");
			button.innerText = layer.getDescription();
			button.onclick = () => {
				this.context.setCurrentLayer(layer);
				this.context.focus();
			};

			this.context.hooks.add("current_layer_change", (newLayer) => {
				button.style["font-weight"] = layer.id === newLayer.id ? "bold" : "normal";
			});

			return button;
		};

		for(const layer of this.context.mapper.backend.layerRegistry.getLayers()) {
			const button = layerButton(layer);
			layerButtonContainer.appendChild(button);
		}

		this.element.appendChild(document.createElement("hr"));

		this.brushStrip = document.createElement("span");

		this.recalculate();

		this.context.hooks.add("size_change", this.recalculate.bind(this));
		this.context.hooks.add("changed_brush", async (brush) => {
			this.brushStrip.remove();
			this.brushStrip = document.createElement("div");
			this.brushStrip.setAttribute("class", "mapper1024_brush_strip");
			await brush.displaySidebar(this, this.brushStrip);
			this.element.appendChild(this.brushStrip);
		});
		this.context.hooks.add("disconnect", this.disconnect.bind(this));
	}

	async recalculate() {
		const padding = 32;
		const hPadding = 8;
		const screenSize = this.context.screenSize();
		const size = new Vector3(this.targetWidth, screenSize.y - padding * 2, 0);
		this.element.style.width = `${size.x}px`;
		this.element.style.height = `${size.y}px`;
		this.element.style.backgroundColor = "#eeeeeebb";
		this.size = size;

		const actualXSize = size.x + (this.element.offsetWidth - this.element.clientWidth);

		const where = new Vector3(screenSize.x - actualXSize - hPadding, padding, 0);
		this.element.style.left = `${where.x}px`;
		this.element.style.top = `${where.y}px`;

		this.element.style.width = `${actualXSize}px`;

		await this.hooks.call("size_change", size);
	}

	disconnect() {
		this.element.remove();
	}
}

const megaTileSize = 512;

class MegaTile {
	constructor(context, oneUnitInPixels, tileCorner) {
		this.tileCorner = tileCorner;
		this.corner = tileCorner.multiplyScalar(megaTileSize);
		this.oneUnitInPixels = oneUnitInPixels;

		this.context = context;

		this.canvas = document.createElement("canvas");
		this.canvas.width = megaTileSize;
		this.canvas.height = megaTileSize;

		this.context = this.canvas.getContext("2d");

		this.nodeIds = new Set();
		this.parts = [];
		this.tileCenterNodeRefCache = {};

		this.tiles = {};
	}

	/**
	 * Get the node drawn at a specific absolute (canvas) point in the specified layer.
	 * @param absolutePoint {Vector3}
	 * @param layer {Layer}
	 * @returns {part|null}
	 */
	async getDrawnNodePartAtPoint(absolutePoint, layer) {
		// For each part in order of most recently rendered first
		for(let i = this.parts.length - 1; i >= 0; i--) {
			const part = this.parts[i];
			// If this part is of a matching layer
			if(layer.id === part.layer.id) {
				// And if this part contains the target point
				if(part.absolutePoint.subtract(absolutePoint).length() < part.radius) {
					// Return this part.
					return part;
				}
			}
		}
		return null;
	}

	/**
	 * Get the node drawn at a specific absolute (canvas) point in the specified layer.
	 * The absolute point must be snapped to the nearest tile center.
	 * This method is intended to be faster (more cacheable) than the more specific #getDrawnNodePartAtPoint
	 * @param tileCenterPoint {Vector3}
	 * @param layer {Layer}
	 * @returns {part|null}
	 */
	async getDrawnNodePartAtPointTileAligned(tileCenterPoint, layer) {
		let cache = this.tileCenterNodeRefCache[layer.id];
		if(cache === undefined) {
			cache = this.tileCenterNodeRefCache[layer.id] = {};
		}

		let cacheX = cache[tileCenterPoint.x];
		if(cacheX === undefined) {
			cacheX = cache[tileCenterPoint.x] = {};
		}

		let nodePart = cacheX[tileCenterPoint.y];
		if(nodePart === undefined) {
			nodePart = cacheX[tileCenterPoint.y] = this.getDrawnNodePartAtPoint(tileCenterPoint, layer);
		}
		return nodePart;
	}

	async addParts(parts) {
		this.parts.push(...parts);
	}
}

function style() {
	const styleElement = document.createElement("style");
	styleElement.innerHTML = `
.mapper1024_brush_bar {
	overflow-y: auto;
	overflow-x: hidden;
}

.mapper1024_brush_strip {
	word-wrap: break-word;
}

.mapper1024_brush_button_container {
	display: flex;
	flex-wrap: wrap;
}

.mapper1024_brush_button {
	padding: 0;
	margin: 0;
	text-overflow: ellipsis;
	overflow: hidden;
	white-space: nowrap;
}

.mapper1024_brush_size_button {
	padding: 0;
	margin: 0;
	font: 32px bold sans;
	width: 32px;
	height: 32px;
	text-align: center;
	line-height: 0;
}

.mapper1024_add_brush_strip {
	margin: 0;
	padding: 0;
}

.mapper1024_add_brush_strip > li {
	list-style-type: none;
}

.mapper1024_add_brush_strip > li > button {
}
	`;
	return styleElement;
}

// Do not edit; automatically generated by tools/update_version.sh
let version = "0.3.2";

/** A render context of a mapper into a specific element.
 * Handles keeping the UI connected to an element on a page.
 * See Mapper.render() for instantiation.
 * Call disconnect() on a render context once the element is no longer being used for a specific Mapper to close event listeners.
 */
class RenderContext {
	/** Construct the render context for the specified mapper in a specific parent element.
	 * Will set up event listeners and build the initial UI.
	 */
	constructor(parent, mapper) {
		this.parent = parent;
		this.mapper = mapper;

		this.alive = true;

		this.hooks = new HookContainer();
		this.keyboardShortcuts = [];

		this.wantRedraw = true;

		this.recalculateViewport = true;
		this.recalculateUpdate = [];
		this.recalculateRemoved = [];
		this.recalculateTranslated = [];
		this.recalculateSelected = [];

		this.wantRecheckSelection = true;
		this.wantUpdateSelection = true;

		this.undoStack = [];
		this.redoStack = [];

		this.nodeRenders = {};
		this.megaTiles = {};
		this.nodeIdsToMegatiles = {};
		this.drawnNodeIds = {};
		this.labelPositions = {};

		this.backgroundColor = "#997";

		this.pressedKeys = {};
		this.mouseDragEvents = {};
		this.oldMousePosition = Vector3.ZERO;
		this.mousePosition = Vector3.ZERO;

		this.debugMode = false;

		this.scrollDelta = 0;

		this.scrollOffset = Vector3.ZERO;
		this.defaultZoom = 5;
		this.zoom = this.defaultZoom;
		this.requestedZoom = this.zoom;

		this.altitudeIncrement = this.mapper.metersToUnits(5);

		this.distanceMarkers = {};

		this.brushes = {
			add: new AddBrush(this),
			select: new SelectBrush(this),
			"delete": new DeleteBrush(this),
			"peg1": new DistancePegBrush(this, 1),
			"peg2": new DistancePegBrush(this, 2),

		};

		this.brush = this.brushes.add;

		this.defaultLayer = this.mapper.backend.layerRegistry.getDefault();
		this.currentLayer = this.defaultLayer;

		this.hoverSelection = new Selection(this, []);
		this.selection = new Selection(this, []);

		this.styleElement = style();
		document.head.appendChild(this.styleElement);

		// The UI is just a canvas.
		// We will keep its size filling the parent element.
		this.canvas = document.createElement("canvas");
		this.canvas.tabIndex = 1;
		this.parent.appendChild(this.canvas);

		// The canvas has no extra size.
		this.canvas.style.padding = "0";
		this.canvas.style.margin = "0";
		this.canvas.style.border = "0";

		this.mapper.hooks.add("updateNode", (nodeRef) => this.recalculateNodeUpdate(nodeRef));
		this.mapper.hooks.add("removeNodes", (nodeRefs) => this.recalculateNodesRemove(nodeRefs));
		this.mapper.hooks.add("translateNodes", (nodeRefs) => this.recalculateNodesTranslate(nodeRefs));
		this.mapper.hooks.add("update", this.requestUpdateSelection.bind(this));


		this.brushbar = new Brushbar(this);

		this.canvas.addEventListener("contextmenu", event => {
			event.preventDefault();
		});

		this.canvas.addEventListener("mousedown", async (event) => {
			if(this.mouseDragEvents[event.button] === undefined) {
				const where = new Vector3(event.x, event.y, 0);

				if(event.button === 0) {
					const dragEvent = await this.brush.activate(where);
					if(dragEvent) {
						this.mouseDragEvents[event.button] = dragEvent;
					}
				}
				else if(event.button === 2) {
					if(this.mouseDragEvents[0] !== undefined) {
						this.cancelMouseButtonPress(0);
					}
					else {
						this.mouseDragEvents[event.button] = new PanEvent(this, where);
					}
				}
			}
		});

		this.canvas.addEventListener("mouseup", async (event) => {
			const where = new Vector3(event.x, event.y, 0);

			this.endMouseButtonPress(event.button, where);
			this.requestRedraw();
		});

		this.canvas.addEventListener("mousemove", async (event) => {
			this.oldMousePosition = this.mousePosition;
			this.mousePosition = new Vector3(event.x, event.y, 0);

			for(const button in this.mouseDragEvents) {
				const mouseDragEvent = this.mouseDragEvents[button];
				await mouseDragEvent.next(this.mousePosition);
			}

			this.requestRecheckSelection();
			this.requestRedraw();
		});

		this.canvas.addEventListener("mouseout", (event) => {
			this.cancelMouseButtonPresses();
		});

		this.canvas.addEventListener("keydown", async (event) => {
			this.pressedKeys[event.key] = true;
			for(const shortcut of this.keyboardShortcuts) {
				if(shortcut.filter(this, event)) {
					if(await shortcut.handler() !== true) {
						return;
					}
				}
			}
			if(this.isKeyDown("Control")) {
				if(event.key === "z") {
					const undo = this.undoStack.pop();
					if(undo !== undefined) {
						this.redoStack.push(await this.performAction(undo, false));
					}
				}
				else if(event.key === "y") {
					const redo = this.redoStack.pop();
					if(redo !== undefined) {
						this.pushUndo(await this.performAction(redo, false), true);
					}
				}
				else if(event.key === "c") {
					await this.forceZoom(this.defaultZoom);
					this.setScrollOffset(Vector3.ZERO);
				}
				else if(event.key === "=") {
					this.requestZoomChange(this.zoom - 1);
					event.preventDefault();
				}
				else if(event.key === "-") {
					this.requestZoomChange(this.zoom + 1);
					event.preventDefault();
				}
			}
			else if(event.key === "ArrowUp") {
				this.setScrollOffset(this.scrollOffset.subtract(new Vector3(0, this.screenSize().y / 3, 0)).round());
			}
			else if(event.key === "ArrowDown") {
				this.setScrollOffset(this.scrollOffset.add(new Vector3(0, this.screenSize().y / 3, 0)).round());
			}
			else if(event.key === "ArrowLeft") {
				this.setScrollOffset(this.scrollOffset.subtract(new Vector3(this.screenSize().x / 3, 0, 0)).round());
			}
			else if(event.key === "ArrowRight") {
				this.setScrollOffset(this.scrollOffset.add(new Vector3(this.screenSize().x / 3, 0, 0)).round());
			}
			else if(event.key === "1") {
				this.changeBrush(this.brushes.peg1);
			}
			else if(event.key === "2") {
				this.changeBrush(this.brushes.peg2);
			}
			else if(event.key === "d") {
				this.changeBrush(this.brushes["delete"]);
			}
			else if(event.key === "a") {
				this.changeBrush(this.brushes.add);
			}
			else if(event.key === "s") {
				this.changeBrush(this.brushes.select);
			}
			else if(event.key === "l") {
				const layerArray = Array.from(this.mapper.backend.layerRegistry.getLayers());
				const layerIdArray = layerArray.map(layer => layer.id);
				this.setCurrentLayer(layerArray[(layerIdArray.indexOf(this.getCurrentLayer().id) + 1) % layerArray.length]);
			}
			else if(event.key === "`") {
				this.debugMode = !this.debugMode;
			}
			else if(event.key === "n") {
				const nodeRef = await this.hoverSelection.getParent();
				if(nodeRef) {
					const where = (await this.getNamePosition(nodeRef)).center;

					const input = document.createElement("input");
					input.value = (await nodeRef.getPString("name")) || "";

					input.style.position = "absolute";
					input.style.left = `${where.x}px`;
					input.style.top = `${where.y}px`;
					input.style.fontSize = "16px";

					const cancel = () => {
						input.removeEventListener("blur", cancel);
						input.remove();
						this.focus();
					};

					const submit = async () => {
						this.performAction(new ChangeNameAction(this, {nodeRef: nodeRef, name: input.value}), true);
						cancel();
					};

					input.addEventListener("blur", cancel);

					input.addEventListener("keyup", (event) => {
						if(event.key === "Escape") {
							cancel();
						}
						else if(event.key === "Enter") {
							submit();
						}
						event.preventDefault();
					});

					this.parent.appendChild(input);
					input.focus();
					event.preventDefault();
				}
			}
			this.requestRedraw();
		});

		this.canvas.addEventListener("keyup", (event) => {
			this.pressedKeys[event.key] = false;
			this.requestRedraw();
		});

		this.canvas.addEventListener("wheel", (event) => {
			event.preventDefault();

			this.scrollDelta = this.scrollDelta + event.deltaY;

			const delta = this.scrollDelta;

			if(Math.abs(delta) >= 100) {

				if(this.isKeyDown("q")) {
					if(delta < 0) {
						this.brush.increment();
					}
					else {
						this.brush.decrement();
					}
				}
				else if(this.isKeyDown("w")) {
					if(delta < 0) {
						this.brush.enlarge();
					}
					else {
						this.brush.shrink();
					}
				}
				else {
					this.requestZoomChange(this.zoom + (delta < 0 ? -1 : 1));
				}

				this.scrollDelta = 0;
			}

			this.requestRedraw();
		});

		// Watch the parent resize so we can keep our canvas filling the whole thing.
		this.parentObserver = new ResizeObserver(() => this.recalculateSize());
		this.parentObserver.observe(this.parent);

		this.recalculateSize();

		window.requestAnimationFrame(this.redrawLoop.bind(this));
		setTimeout(this.recalculateLoop.bind(this), 10);
		setTimeout(this.recalculateSelection.bind(this), 10);

		this.changeBrush(this.brushes.add);
		this.setCurrentLayer(this.getCurrentLayer());
	}

	async getNamePosition(nodeRef) {
		const labelPositions = this.labelPositions[this.zoom];
		if(labelPositions !== undefined) {
			const labelPositionOnCanvas = labelPositions[nodeRef.id];
			if(labelPositionOnCanvas !== undefined) {
				return labelPositionOnCanvas;
			}
		}

		return {
			center: this.mapPointToAbsoluteCanvas(await nodeRef.getCenter()),
			size: 24,
		};
	}

	getCurrentLayer() {
		return this.currentLayer;
	}

	setCurrentLayer(layer) {
		this.currentLayer = layer;
		this.brush.signalLayerChange(layer);
		this.hooks.call("current_layer_change", layer);
		this.requestRecheckSelection();
	}

	isPanning() {
		return this.mouseDragEvents[2] instanceof PanEvent;
	}

	isCalculatingDistance() {
		return this.brush instanceof DistancePegBrush;
	}

	setScrollOffset(value) {
		this.scrollOffset = value;
		this.recalculateEntireViewport();
	}

	registerKeyboardShortcut(filter, handler) {
		this.keyboardShortcuts.push({
			filter: filter,
			handler: handler,
		});
	}

	changeBrush(brush) {
		this.brush = brush;
		this.brush.switchTo();
		this.hooks.call("changed_brush", brush);
		this.requestRedraw();
	}

	requestZoomChange(zoom) {
		this.requestedZoom = Math.max(1, Math.min(zoom, 30));
	}

	forceZoom(zoom) {
		return new Promise((resolve) => {
			if(this.zoom === zoom) {
				resolve(this.zoom);
			}
			else {
				let f;
				f = () => {
					resolve(this.zoom);
					this.hooks.remove("changed_zoom", f);
				};

				this.hooks.add("changed_zoom", f);

				this.requestZoomChange(zoom);
			}
		});
	}

	async redrawLoop() {
		if(this.wantRedraw) {
			this.wantRedraw = false;
			await this.redraw();
		}

		if(this.alive) {
			window.requestAnimationFrame(this.redrawLoop.bind(this));
		}
	}

	async recalculateSelection() {
		if(this.wantRecheckSelection && !this.isAnyMouseButtonDown()) {
			this.wantRecheckSelection = false;

			const oldHoverIds = this.hoverSelection.parentNodeIds;

			const closestNodePart = await this.getDrawnNodePartAtCanvasPoint(this.mousePosition, this.getCurrentLayer());
			if(closestNodePart) {
				this.hoverSelection = await Selection.fromNodeRefs(this, [closestNodePart.nodeRef]);
			}
			else {
				this.hoverSelection = new Selection(this, []);
			}

			const newHoverIds = this.hoverSelection.parentNodeIds;

			for(const nodeId of oldHoverIds) {
				if(!newHoverIds.has(nodeId)) {
					this.recalculateNodesSelected([this.mapper.backend.getNodeRef(nodeId)]);
				}
			}

			for(const nodeId of newHoverIds) {
				if(!oldHoverIds.has(nodeId)) {
					this.recalculateNodesSelected([this.mapper.backend.getNodeRef(nodeId)]);
				}
			}
		}

		if(this.wantUpdateSelection) {
			this.wantUpdateSelection = false;
			await this.hoverSelection.update();
			await this.selection.update();
			this.requestRedraw();
		}

		if(this.alive) {
			setTimeout(this.recalculateSelection.bind(this), 100);
		}
	}

	/** Get the altitude of the map object pointed to by the cursor at the point pointed to.
	 * @returns {number} The Z coordinate of that point on the map.
	 */
	async getCursorAltitude() {
		// Just return the first Z coordinate of whatever we're hovering over.
		for (const origin of this.hoverSelection.getOrigins()) {
			return (await origin.getCenter()).z;
		}

		// Hovering over nothing, use default value.
		return 0;
	}

	/** Get the node drawn at a specific canvas point in the specified layer.
	 * @param point {Vector3}
	 * @param layer {Layer}
	 * @returns {part|null}
	 */
	async getDrawnNodePartAtCanvasPoint(point, layer) {
		const absolutePoint = point.add(this.scrollOffset);
		const absoluteMegaTile = absolutePoint.divideScalar(megaTileSize).map(Math.floor);
		const megaTiles = this.megaTiles[this.zoom];
		if(megaTiles !== undefined) {
			const megaTileX = megaTiles[absoluteMegaTile.x];
			if(megaTileX !== undefined) {
				const megaTile = megaTileX[absoluteMegaTile.y];
				if(megaTile !== undefined) {
					return megaTile.getDrawnNodePartAtPoint(absolutePoint, layer);
				}
			}
		}
		return null;
	}

	async getDrawnNodePartAtAbsoluteCanvasPointTileAligned(absolutePoint, layer) {
		const absoluteMegaTile = absolutePoint.divideScalar(megaTileSize).map(Math.floor);
		const megaTiles = this.megaTiles[this.zoom];
		if(megaTiles !== undefined) {
			const megaTileX = megaTiles[absoluteMegaTile.x];
			if(megaTileX !== undefined) {
				const megaTile = megaTileX[absoluteMegaTile.y];
				if(megaTile !== undefined) {
					return megaTile.getDrawnNodePartAtPointTileAligned(absolutePoint, layer);
				}
			}
		}
		return null;
	}

	async getBackgroundNode(nodeRef) {
		let bestNode = null;

		for await (const candidateNodeRef of this.mapper.getNodesTouchingArea(Box3.fromRadius(await nodeRef.getEffectiveCenter(), this.pixelsToUnits(1)).map(v => v.noZ()), this.pixelsToUnits(1))) {
			const candidateType = await candidateNodeRef.getType();
			if(!candidateType.givesBackground() || candidateType.id === (await nodeRef.getType()).id || (await candidateNodeRef.getLayer()).id !== (await nodeRef.getLayer()).id || (await candidateNodeRef.getEffectiveCenter()).subtract(await nodeRef.getEffectiveCenter()).length() >= (await candidateNodeRef.getRadius())) {
				continue;
			}

			if(!bestNode || (await candidateNodeRef.getEffectiveCenter()).z > (await bestNode.getEffectiveCenter()).z) {
				bestNode = candidateNodeRef;
			}
		}

		return bestNode;
	}

	async recalculateLoop() {
		// Change the zoom level if requested.
		// We do this in the same async loop method as recalculating the renderings so that the rendering is never out of sync between zoom levels.
		if(this.zoom !== this.requestedZoom) {
			const oldLandmark = this.canvasPointToMap(this.mousePosition);
			this.zoom = this.requestedZoom;
			const newLandmark = this.canvasPointToMap(this.mousePosition);
			this.scrollOffset = this.scrollOffset.add(this.mapPointToCanvas(oldLandmark).subtract(this.mapPointToCanvas(newLandmark)));
			await this.hooks.call("changed_zoom", this.zoom);
			this.recalculateEntireViewport();
		}

		// If anything's changed on the map, try to recalculate the renderings.
		if(this.recalculateViewport || this.recalculateUpdate.length > 0 || this.recalculateRemoved.length > 0 || this.recalculateTranslated.length > 0 || this.recalculateSelected.length > 0) {
			await this.recalculate(this.recalculateViewport, this.recalculateUpdate.splice(0, this.recalculateUpdate.length), this.recalculateRemoved.splice(0, this.recalculateRemoved.length), this.recalculateTranslated.splice(0, this.recalculateTranslated.length), this.recalculateSelected.splice(0, this.recalculateSelected.length));
			this.recalculateViewport = false;
		}

		if(this.alive) {
			setTimeout(this.recalculateLoop.bind(this), 100);
		}
	}

	async performAction(action, addToUndoStack) {
		const undo = await action.perform();
		if(addToUndoStack) {
			this.pushUndo(undo);
		}
		return undo;
	}

	hoveringOverSelection() {
		return this.selection.exists() && this.hoverSelection.exists() && this.selection.contains(this.hoverSelection);
	}

	pushUndo(action, fromRedo) {
		if(!action.empty()) {
			this.undoStack.push(action);
			if(!fromRedo) {
				this.redoStack = [];
			}
		}
	}

	requestRecheckSelection() {
		this.wantRecheckSelection = true;
	}

	requestUpdateSelection() {
		this.wantUpdateSelection = true;
	}

	requestRedraw() {
		this.wantRedraw = true;
	}

	focus() {
		this.canvas.focus();
	}

	isKeyDown(key) {
		return !!this.pressedKeys[key];
	}

	isAnyMouseButtonDown() {
		for(const button in this.mouseDragEvents) {
			return true;
		}

		return false;
	}

	isMouseButtonDown(button) {
		return !!this.mouseDragEvents[button];
	}

	endMouseButtonPress(button, where) {
		if(this.mouseDragEvents[button] !== undefined) {
			this.mouseDragEvents[button].end(where);
			delete this.mouseDragEvents[button];
		}
	}

	cancelMouseButtonPress(button) {
		if(this.mouseDragEvents[button] !== undefined) {
			this.mouseDragEvents[button].cancel();
			delete this.mouseDragEvents[button];
			this.requestRedraw();
		}
	}

	cancelMouseButtonPresses() {
		for(const button in this.mouseDragEvents) {
			this.cancelMouseButtonPress(button);
		}
	}

	getBrush() {
		return this.brush;
	}

	canvasPointToMap(v) {
		return new Vector3(v.x, v.y, 0).add(this.scrollOffset).map((a) => this.pixelsToUnits(a));
	}

	mapPointToCanvas(v) {
		return new Vector3(v.x, v.y, 0).map((a) => this.unitsToPixels(a)).subtract(this.scrollOffset);
	}

	mapPointToAbsoluteCanvas(v) {
		return new Vector3(v.x, v.y, 0).map((a) => this.unitsToPixels(a));
	}

	canvasPathToMap(path) {
		return path.mapOrigin((origin) => this.canvasPointToMap(origin)).mapLines((v) => v.map((a) => this.pixelsToUnits(a)));
	}

	pixelsToUnits(pixels) {
		return pixels * this.zoom / (1 + 20 / this.zoom);
	}

	unitsToPixels(units) {
		return units / this.pixelsToUnits(1);
	}

	screenSize() {
		return new Vector3(this.canvas.width, this.canvas.height, 0);
	}

	screenBox() {
		return new Box3(Vector3.ZERO, this.screenSize());
	}

	absoluteScreenBox() {
		return new Box3(this.scrollOffset, this.screenSize().add(this.scrollOffset));
	}

	/** Recalculate the UI size based on the parent.
	 * This requires a full redraw.
	 */
	recalculateSize() {
		// Keep the canvas matching the parent size.
		this.canvas.width = this.parent.clientWidth;
		this.canvas.height = this.parent.clientHeight;

		this.hooks.call("size_change");
		this.recalculateEntireViewport();
	}

	getNodeRender(nodeRef) {
		let nodeRender = this.nodeRenders[nodeRef.id];
		if(nodeRender === undefined) {
			this.nodeRenders[nodeRef.id] = nodeRender = new NodeRender(this, nodeRef);
		}
		return nodeRender;
	}

	invalidateNodeRender(nodeRef) {
		this.removeNodeRender(nodeRef);
	}

	removeNodeRender(nodeRef) {
		delete this.nodeRenders[nodeRef.id];
	}

	recalculateEntireViewport() {
		this.recalculateViewport = true;
	}

	async objectNode(nodeRef) {
		if(await nodeRef.getNodeType() === "object")
			return nodeRef;
		else
			return await nodeRef.getParent();
	}

	recalculateNodeUpdate(nodeRef) {
		this.recalculateUpdate.push(nodeRef);
	}

	recalculateNodesRemove(nodeRefs) {
		this.recalculateRemoved.push(...nodeRefs);
	}

	recalculateNodesTranslate(nodeRefs) {
		this.recalculateTranslated.push(...nodeRefs);
	}

	recalculateNodesSelected(nodeRefs) {
		this.recalculateSelected.push(...nodeRefs);
	}

	async recalculate(viewport, updatedNodeRefs, removedNodeRefs, translatedNodeRefs, selectedNodeRefs) {
		const redrawNodeIds = new Set();
		const updateNodeIds = new Set();

		updatedNodeRefs.push(...selectedNodeRefs);

		let drawnNodeIds = this.drawnNodeIds[this.zoom];
		if(drawnNodeIds === undefined) {
			drawnNodeIds = this.drawnNodeIds[this.zoom] = new Set();
		}

		let labelPositions = this.labelPositions[this.zoom];
		if(labelPositions === undefined) {
			labelPositions = this.labelPositions[this.zoom] = {};
		}

		const visibleNodeIds = new Set(await asyncFrom(this.visibleObjectNodes(), nodeRef => nodeRef.id));

		for(const visibleNodeId of visibleNodeIds) {
			if(viewport || !drawnNodeIds.has(visibleNodeId)) {
				redrawNodeIds.add(visibleNodeId);
				updateNodeIds.add(visibleNodeId);
			}
		}

		for(const nodeRef of updatedNodeRefs) {
			const actualNodeRef = await this.objectNode(nodeRef);
			this.invalidateNodeRender(actualNodeRef);
			redrawNodeIds.add(actualNodeRef.id);
			updateNodeIds.add(actualNodeRef.id);
		}

		for(const nodeRef of removedNodeRefs) {
			const actualNodeRef = await this.objectNode(nodeRef);
			this.removeNodeRender(actualNodeRef);
			redrawNodeIds.add(actualNodeRef.id);
			drawnNodeIds.delete(actualNodeRef.id);
			delete labelPositions[actualNodeRef.id];
		}

		for(const nodeRef of translatedNodeRefs) {
			redrawNodeIds.add(nodeRef.id);
		}

		const redrawMegaTiles = new Set();

		for(const nodeId of redrawNodeIds) {
			const megaTilesByNode = this.nodeIdsToMegatiles[nodeId];
			if(megaTilesByNode !== undefined) {
				for(const megaTile of megaTilesByNode) {
					const tilePosition = megaTile.tileCorner;
					for(const nodeId of megaTile.nodeIds) {
						updateNodeIds.add(nodeId);
					}
					delete this.megaTiles[megaTile.oneUnitInPixels][tilePosition.x][tilePosition.y];
				}
				delete this.nodeIdsToMegatiles[nodeId];
			}
		}

		for(const nodeRef of removedNodeRefs) {
			const actualNodeRef = await this.objectNode(nodeRef);
			delete this.nodeIdsToMegatiles[actualNodeRef.id];
		}

		const screenBox = this.absoluteScreenBox();
		const screenBoxInTiles = this.absoluteScreenBox().map(v => v.divideScalar(tileSize).map(Math.floor));
		const screenBoxInMegaTiles = this.absoluteScreenBox().map(v => v.divideScalar(megaTileSize).map(Math.floor));

		let megaTiles = this.megaTiles[this.zoom];
		if(megaTiles === undefined) {
			megaTiles = this.megaTiles[this.zoom] = {};
		}

		const drewToMegaTiles = new Set();

		const nodeLayers = Array.from(this.mapper.backend.layerRegistry.getLayers());
		nodeLayers.sort((a, b) => a.getZ() - b.getZ());

		for(const nodeLayer of nodeLayers) {
			const focusTiles = {};

			const drawNodeIds = async (nodeIds) => {
				const drawAgainIds = new Set();
				const layers = [];

				const focusTileLists = new Set();

				for(const nodeId of nodeIds) {
					const nodeRef = this.mapper.backend.getNodeRef(nodeId);
					if((await nodeRef.getLayer()).id !== nodeLayer.id)
						continue;

					drawnNodeIds.add(nodeRef.id);

					const nodeRender = this.getNodeRender(nodeRef);
					for(const layer of await nodeRender.getLayers(this.zoom)) {
						layers.push(layer);
						focusTileLists.add(layer.focusTiles);
					}

					if(this.nodeIdsToMegatiles[nodeId] === undefined)
						this.nodeIdsToMegatiles[nodeId] = new Set();
				}

				layers.sort((a, b) => a.z - b.z);

				for(const layer of layers) {
					const nodeId = layer.nodeRender.nodeRef.id;
					const nodeInSelection = this.selection.hasNodeId(nodeId) || this.hoverSelection.hasNodeId(nodeId);

					const absoluteLayerBox = Box3.fromOffset(layer.corner, new Vector3(layer.width, layer.height, 0));
					const layerBoxInMegaTiles = absoluteLayerBox.map(v => v.divideScalar(megaTileSize).map(Math.floor));

					for(let x = Math.max(layerBoxInMegaTiles.a.x, screenBoxInMegaTiles.a.x); x <= Math.min(layerBoxInMegaTiles.b.x, screenBoxInMegaTiles.b.x); x++) {
						let megaTileX = megaTiles[x];
						if(megaTileX === undefined) {
							megaTileX = megaTiles[x] = {};
						}

						for(let y = Math.max(layerBoxInMegaTiles.a.y, screenBoxInMegaTiles.a.y); y <= Math.min(layerBoxInMegaTiles.b.y, screenBoxInMegaTiles.b.y); y++) {
							const megaTilePoint = new Vector3(x, y, 0);

							let megaTile = megaTileX[y];
							if(megaTile === undefined) {
								megaTile = megaTileX[y] = new MegaTile(this, this.zoom, megaTilePoint);
								redrawMegaTiles.add(megaTile);
							}

							const firstAppearanceInMegaTile = !megaTile.nodeIds.has(nodeId);

							if(redrawMegaTiles.has(megaTile) || firstAppearanceInMegaTile) {
								const pointOnLayer = megaTilePoint.multiplyScalar(megaTileSize).subtract(absoluteLayerBox.a);
								const realPointOnLayer = pointOnLayer.map(c => Math.max(c, 0));
								const pointOnMegaTile = realPointOnLayer.subtract(pointOnLayer);

								const layerImage = await layer.canvas();
								let toRenderCanvas = layerImage;

								if(nodeInSelection) {
									toRenderCanvas = document.createElement("canvas");
									toRenderCanvas.width = layerImage.width;
									toRenderCanvas.height = layerImage.height;

									const c = toRenderCanvas.getContext("2d");
									c.drawImage(layerImage, 0, 0);
									c.globalCompositeOperation = "source-atop";
									c.fillStyle = "black";
									c.globalAlpha = 0.1;
									c.fillRect(0, 0, toRenderCanvas.width, toRenderCanvas.height);
								}
								megaTile.context.drawImage(toRenderCanvas, realPointOnLayer.x, realPointOnLayer.y, megaTileSize, megaTileSize, pointOnMegaTile.x, pointOnMegaTile.y, megaTileSize, megaTileSize);

								this.nodeIdsToMegatiles[nodeId].add(megaTile);
								megaTile.nodeIds.add(nodeId);
								megaTile.addParts(layer.parts);

								drewToMegaTiles.add(megaTile);

								let averagePartPoint = Vector3.ZERO;
								for(const part of layer.parts) {
									averagePartPoint = averagePartPoint.add(part.absolutePoint);
								}

								labelPositions[nodeId] = {
									center: Vector3.max(Vector3.min(averagePartPoint.divideScalar(layer.parts.length), screenBox.b), screenBox.a),
									size: Math.min(24, Math.ceil(this.unitsToPixels(await this.mapper.backend.getNodeRef(nodeId).getRadius()) / 4)),
								};
							}

							if(firstAppearanceInMegaTile) {
								for(const otherNodeId of megaTile.nodeIds) {
									drawAgainIds.add(otherNodeId);
								}
							}
						}
					}
				}

				for(const subFocusTiles of focusTileLists) {
					for(const tX in subFocusTiles) {
						const subFocusTilesX = subFocusTiles[tX];
						let focusTilesX = focusTiles[tX];
						if(focusTilesX === undefined) {
							focusTilesX = focusTiles[tX] = {};
						}
						for(const tY in subFocusTilesX) {
							focusTilesX[tY] = subFocusTilesX[tY];
						}
					}
				}

				return drawAgainIds;
			};

			const secondPassNodeIds = await drawNodeIds(updateNodeIds);
			await drawNodeIds(secondPassNodeIds);

			for(let tX in focusTiles) {
				tX = +tX;
				if(tX >= screenBoxInTiles.a.x && tX <= screenBoxInTiles.b.x) {
					const megaTilePointX = Math.floor(tX * tileSize / megaTileSize);
					const megaTileX = megaTiles[megaTilePointX];
					if(megaTileX !== undefined) {
						const focusTilesX = focusTiles[tX];
						for(let tY in focusTilesX) {
							tY = +tY;
							if(tY >= screenBoxInTiles.a.y && tY <= screenBoxInTiles.b.y) {
								const megaTilePointY = Math.floor(tY * tileSize / megaTileSize);
								const megaTile = megaTileX[megaTilePointY];
								if(drewToMegaTiles.has(megaTile)) {
									const tile = focusTilesX[tY];
									const center = tile.centerPoint;
									const drawPoint = center.subtract(megaTile.corner);

									const neighbors = [];

									for(const dirKey of dirKeys) {
										const tileDir = dirs[dirKey].multiplyScalar(tileSize);
										const neighborPoint = center.add(tileDir.divideScalar(2));
										const neighborNodePart = await this.getDrawnNodePartAtAbsoluteCanvasPointTileAligned(neighborPoint, tile.layer);
										if(neighborNodePart) {
											neighbors.push({
												nodeRef: neighborNodePart.nodeRef,
												part: neighborNodePart,
												angle: dirAngles[dirKey],
												normalizedDir: normalizedDirs[dirKey],
											});
										}
									}

									for(const neighbor of neighbors) {
										const c = megaTile.context;

										c.fillStyle = neighbor.part.fillStyle;
										c.globalAlpha = 0.5;

										const angle = neighbor.angle;

										const arcPoint = drawPoint.add(neighbor.normalizedDir.multiplyScalar(tileSize / 2));

										c.beginPath();
										c.arc(arcPoint.x, arcPoint.y, tileSize / 2, angle - Math.PI / 2, angle + Math.PI / 2, false);
										c.fill();

										const nodeInSelection = this.selection.hasNodeRef(neighbor.nodeRef) || this.hoverSelection.hasNodeRef(neighbor.nodeRef);
										if(nodeInSelection) {
											c.globalAlpha = 0.05;
											c.fillStyle = "black";

											c.beginPath();
											c.arc(arcPoint.x, arcPoint.y, tileSize / 2, angle - Math.PI / 2, angle + Math.PI / 2, false);
											c.fill();
										}

										//const p = tile.absolutePoint.subtract(megaTile.corner);
										//c.strokeRect(p.x, p.y, tileSize, tileSize);

										c.globalAlpha = 1;
									}
								}
							}
						}
					}
				}
			}
		}

		this.requestRedraw();
	}

	async drawBrush() {
		await this.brush.draw(this.canvas.getContext("2d"), this.mousePosition);
	}

	async clearCanvas() {
		const c = this.canvas.getContext("2d");
		c.beginPath();
		c.rect(0, 0, this.canvas.width, this.canvas.height);
		c.fillStyle = this.backgroundColor;
		c.fill();
	}

	async drawHelp() {
		const c = this.canvas.getContext("2d");
		c.textBaseline = "top";
		c.font = "18px sans";

		let infoLineY = 9;
		function infoLine(l) {
			const measure = c.measureText(l);
			c.globalAlpha = 0.25;
			c.fillStyle = "black";
			c.fillRect(18, infoLineY - 2, measure.width, Math.abs(measure.actualBoundingBoxAscent) + Math.abs(measure.actualBoundingBoxDescent) + 4);
			c.globalAlpha = 1;
			c.fillStyle = "white";
			c.fillText(l, 18, infoLineY);
			infoLineY += 24;
		}

		infoLine("Change brush mode with (A)dd, (S)elect or (D)elete. Press 1 or 2 to measure distances.");

		// Debug help
		infoLine("Press N to set or edit an object's name. Scroll or Ctrl+Plus/Minus to zoom. L to change layer.");
		if(this.brush instanceof AddBrush) {
			infoLine("Click to add terrain");
			infoLine("Hold Q while scrolling to change brush terrain/type; hold W while scrolling to change brush size.");
		}
		else if(this.brush instanceof SelectBrush) {
			infoLine("Click to select, drag to move.");
			infoLine("Hold Control to add to an existing selection.");
		}
		else if(this.brush instanceof DeleteBrush) {
			infoLine("Click to delete an area. Hold Shift to delete an entire object.");
			infoLine("Hold W while scrolling to change brush size.");
		}
		infoLine("Right click or arrow keys to move map. Ctrl+C to return to center. Ctrl+Z is undo, Ctrl+Y is redo. ` to toggle debug mode.");

		await this.hooks.call("draw_help", {
			infoLine: infoLine,
		});

		if(this.isCalculatingDistance()) {
			const a = this.distanceMarkers[1];
			const b = this.distanceMarkers[2];

			if(a && b) {
				const meters = this.mapper.unitsToMeters(a.subtract(b).length());
				infoLine(`Distance between markers: ${Math.floor(meters + 0.5)}m (${Math.floor(meters / 1000 + 0.5)}km)`);
			}
		}
	}

	async drawDebug() {
		const c = this.canvas.getContext("2d");

		const drawn = new Set();

		c.setLineDash([]);

		const drawNodePoint = async (nodeRef) => {
			if(!drawn.has(nodeRef.id)) {
				drawn.add(nodeRef.id);
				const position = this.mapPointToCanvas(await nodeRef.getCenter());
				c.beginPath();
				c.arc(position.x, position.y, 4, 0, 2 * Math.PI, false);
				c.strokeStyle = "white";
				c.stroke();

				// Draw edges.
				for await (const dirEdgeRef of nodeRef.getEdges()) {
					if(!drawn.has(dirEdgeRef.id)) {
						drawn.add(dirEdgeRef.id);
						const otherNodeRef = await dirEdgeRef.getDirOtherNode();
						const otherPosition = this.mapPointToCanvas(await otherNodeRef.getCenter());
						c.strokeStyle = "white";
						c.beginPath();
						c.moveTo(position.x, position.y);
						c.lineTo(otherPosition.x, otherPosition.y);
						c.stroke();
					}
				}

				// Draw effective bounding radius.
				const effectivePosition = this.mapPointToCanvas(await nodeRef.getEffectiveCenter());
				c.beginPath();
				c.arc(effectivePosition.x, effectivePosition.y, this.unitsToPixels(await nodeRef.getRadius()), 0, 2 * Math.PI, false);
				c.strokeStyle = "gray";
				c.stroke();
			}
		};

		for await (const nodeRef of this.drawnNodes()) {
			// Draw center.
			await drawNodePoint(nodeRef);

			// Draw border path.
			for await (const child of nodeRef.getChildren()) {
				await drawNodePoint(child);
			}

			// Draw bounding radius.
			const position = this.mapPointToCanvas(await nodeRef.getCenter());
			c.beginPath();
			c.arc(position.x, position.y, this.unitsToPixels(await nodeRef.getRadius()), 0, 2 * Math.PI, false);
			c.strokeStyle = "gray";
			c.stroke();
		}

		c.strokeStyle = "black";

		const screenBoxInMegaTiles = this.absoluteScreenBox().map(v => v.divideScalar(megaTileSize).map(Math.floor));
		for(let x = screenBoxInMegaTiles.a.x; x <= screenBoxInMegaTiles.b.x; x++) {
			for(let y = screenBoxInMegaTiles.a.y; y <= screenBoxInMegaTiles.b.y; y++) {
				const point = new Vector3(x, y, 0).multiplyScalar(megaTileSize).subtract(this.scrollOffset);
				c.strokeRect(point.x, point.y, megaTileSize, megaTileSize);
				c.strokeText(`${x}, ${y}`, point.x, point.y);
			}
		}
	}

	async drawScale() {
		const c = this.canvas.getContext("2d");
		const barHeight = 10;
		const barWidth = this.canvas.width / 5 - mod(this.canvas.width / 5, this.unitsToPixels(this.mapper.metersToUnits(10 ** Math.ceil(Math.log10(this.zoom * 5)))));
		const barX = 10;
		const label2Y = this.canvas.height - barHeight;
		const barY = label2Y - barHeight - 15;
		const labelY = barY - barHeight / 2;

		c.textBaseline = "alphabetic";

		c.fillStyle = "black";
		c.fillRect(barX, barY, barWidth, barHeight);

		c.font = "16px mono";
		c.fillStyle = "white";

		for(let point = 0; point < 6; point++) {
			const y = (point % 2 === 0) ? labelY : label2Y;
			const pixel = barWidth * point / 5;
			c.fillText(`${Math.floor(this.mapper.unitsToMeters(this.pixelsToUnits(pixel)) + 0.5)}m`, barX + pixel, y);
			c.fillRect(barX + pixel, barY, 2, barHeight);
		}
	}

	async drawVersion() {
		const c = this.canvas.getContext("2d");

		c.textBaseline = "top";
		c.font = "14px sans";

		const text = `v${version}`;
		const measure = c.measureText(text);

		const x = this.screenBox().b.x - measure.width;
		const height = Math.abs(measure.actualBoundingBoxAscent) + Math.abs(measure.actualBoundingBoxDescent);

		c.globalAlpha = 0.25;
		c.fillStyle = "black";
		c.fillRect(x, 0, measure.width, height);

		c.fillStyle = "white";
		c.globalAlpha = 1;

		c.fillText(text, x, 0);
	}

	async drawPegs() {
		const c = this.canvas.getContext("2d");

		const colors = {
			1: "red",
			2: "blue",
		};

		const positions = {};

		for(const distanceMarkerN in this.distanceMarkers) {
			const distanceMarker = this.distanceMarkers[distanceMarkerN];
			const position = this.mapPointToCanvas(distanceMarker);
			positions[distanceMarkerN] = position;
			c.beginPath();
			c.arc(position.x, position.y, 4, 0, 2 * Math.PI, false);
			c.fillStyle = colors[distanceMarkerN] || "black";
			c.fill();

			c.fillStyle = "white";

			c.textBaseline = "alphabetic";
			c.font = "16px mono";
			const worldPosition = this.canvasPointToMap(position).map(c => this.mapper.unitsToMeters(c)).round();
			const text = `${worldPosition.x}m, ${worldPosition.y}m, ${worldPosition.z}m`;
			c.fillText(text, position.x - c.measureText(text).width / 2, position.y - 16);
		}

		if(positions[1] && positions[2]) {
			c.lineWidth = 3;

			c.setLineDash([5, 15]);

			c.strokeStyle = "black";
			c.beginPath();
			c.moveTo(positions[1].x, positions[1].y);
			c.lineTo(positions[2].x, positions[2].y);
			c.stroke();

			c.setLineDash([11, 22]);

			c.strokeStyle = "white";
			c.beginPath();
			c.moveTo(positions[1].x, positions[1].y);
			c.lineTo(positions[2].x, positions[2].y);
			c.stroke();

			c.setLineDash([]);
			c.lineWidth = 1;

			const meters = this.mapper.unitsToMeters(this.distanceMarkers[1].subtract(this.distanceMarkers[2]).length());

			c.textBaseline = "top";
			c.font = "16px mono";
			const position = this.mapPointToCanvas(positions[1].add(positions[2]).divideScalar(2).round());
			const text = `Distance between markers: ${Math.floor(meters + 0.5)}m (${Math.floor(meters / 1000 + 0.5)}km)`;
			const measure = c.measureText(text);
			const height = Math.abs(measure.actualBoundingBoxAscent) + Math.abs(measure.actualBoundingBoxDescent);
			c.globalAlpha = 0.25;
			c.fillStyle = "black";
			c.fillRect(position.x - measure.width / 2, position.y, measure.width, height);
			c.globalAlpha = 1;
			c.fillStyle = "white";
			c.fillText(text, position.x - measure.width / 2, position.y);

		}
	}

	async drawNodes() {
		const c = this.canvas.getContext("2d");

		const megaTiles = this.megaTiles[this.zoom];
		if(megaTiles !== undefined) {
			const screenBoxInMegaTiles = this.absoluteScreenBox().map(v => v.divideScalar(megaTileSize).map(Math.floor));
			for(let x = screenBoxInMegaTiles.a.x; x <= screenBoxInMegaTiles.b.x; x++) {
				const megaTileX = megaTiles[x];
				if(megaTileX !== undefined) {
					for(let y = screenBoxInMegaTiles.a.y; y <= screenBoxInMegaTiles.b.y; y++) {
						const megaTile = megaTileX[y];
						if(megaTile !== undefined) {
							const point = megaTile.corner.subtract(this.scrollOffset);
							c.drawImage(megaTile.canvas, point.x, point.y);
						}
					}
				}
			}
		}
	}

	async drawLabels() {
		const c = this.canvas.getContext("2d");
		c.textBaseline = "top";

		const currentLayer = this.getCurrentLayer();

		for await (const nodeRef of this.drawnNodes()) {
			const labelText = await nodeRef.getPString("name");
			if(labelText !== undefined && labelText.length > 0) {
				const labelPositionOnCanvas = await this.getNamePosition(nodeRef);
				const layer = (await nodeRef.getType()).getLayer();
				const layerSelected = layer.id === currentLayer.id;
				const selected = (this.selection.hasNodeRef(nodeRef) || this.hoverSelection.hasNodeRef(nodeRef));
				const fontSize = (selected ? 24 : labelPositionOnCanvas.size) * (layerSelected ? 1 : 0.5);
				const font = layerSelected ? "serif" : "sans";
				c.font = selected ? `bold ${fontSize}px ${font}` : `${fontSize}px ${font}`;

				const measure = c.measureText(labelText);
				const height = Math.abs(measure.actualBoundingBoxAscent) + Math.abs(measure.actualBoundingBoxDescent);
				const where = labelPositionOnCanvas.center.subtract(this.scrollOffset).subtract(new Vector3(measure.width / 2, height / 2, 0, 0));
				c.globalAlpha = 0.25;
				c.fillStyle = "black";
				c.fillRect(where.x, where.y, measure.width, height);
				c.globalAlpha = 1;
				c.fillStyle = "white";
				c.fillText(labelText, where.x, where.y);
			}
		}
	}

	/** Completely redraw the displayed UI. */
	async redraw() {
		await this.clearCanvas();

		await this.drawNodes();
		await this.drawLabels();

		if(this.isCalculatingDistance()) {
			await this.drawPegs();
		}
		await this.drawBrush();

		await this.drawHelp();
		await this.drawScale();

		if(this.debugMode) {
			await this.drawDebug();
		}

		await this.drawVersion();
	}

	async * visibleObjectNodes() {
		yield* this.getObjectNodesInRelativeBox(this.screenBox());
	}

	async * getObjectNodesInAbsoluteBox(box) {
		yield* this.getObjectNodesInBox(box.map(v => v.map(c => this.pixelsToUnits(c))));
	}

	async * getObjectNodesInRelativeBox(box) {
		yield* this.getObjectNodesInBox(box.map((v) => this.canvasPointToMap(v)));
	}

	async * getObjectNodesInBox(box) {
		const mapBox = box.map(v => v);
		mapBox.a.z = -Infinity;
		mapBox.b.z = Infinity;
		yield* this.mapper.getObjectNodesTouchingArea(mapBox, this.pixelsToUnits(1));
	}

	async * drawnNodes() {
		const drawnNodeIds = this.drawnNodeIds[this.zoom];
		if(drawnNodeIds !== undefined) {
			for(const nodeId of drawnNodeIds) {
				yield this.mapper.backend.getNodeRef(nodeId);
			}
		}
	}

	/** Disconnect the render context from the page and clean up listeners. */
	disconnect() {
		this.alive = false;
		this.hooks.call("disconnect").then(() => {
			this.styleElement.remove();
			this.parentObserver.disconnect();
			this.canvas.remove();
		});
	}
}

/** Mapper interface
 * A connection to a database and mapper UI.
 * Instantiate Mapper and then call the render() method to insert the UI into a div element.
 */
class Mapper {
	/* Set the backend for the mapper, i.e. the map it is presenting.
	 * See: backend.js
	 */
	constructor(backend) {
		this.backend = backend;
		this.hooks = new HookContainer();

		this.backend.hooks.add("load", async () => await this.hooks.call("update"));
		this.hooks.add("updateNode", async () => await this.hooks.call("update"));
		this.hooks.add("insertNode", async (nodeRef) => await this.hooks.call("updateNode", nodeRef));
		this.hooks.add("removeNodes", async () => await this.hooks.call("update"));
		this.hooks.add("translateNodes", async () => await this.hooks.call("update"));

		this.hooks.add("update", () => { this.declareUnsavedChanges(); });

		this.options = {
			blendDistance: 400,
			cleanNormalDistance: 0.5,
		};

		this.unsavedChanges = false;
	}

	unitsToMeters(units) {
		return units * 2;
	}

	metersToUnits(meters) {
		return meters / this.unitsToMeters(1);
	}

	clearUnsavedChangeState() {
		this.unsavedChanges = false;
		this.hooks.call("unsavedStateChange", false);
	}

	declareUnsavedChanges() {
		this.unsavedChanges = true;
		this.hooks.call("unsavedStateChange", true);
	}

	hasUnsavedChanges() {
		return this.unsavedChanges;
	}

	/** Get all nodes in or near a spatial box (according to their radii).
	 * @param box {Box3}
	 * @param minRadius {number}
	 * @returns {AsyncIterable.<NodeRef>}
	 */
	async * getNodesTouchingArea(box, minRadius) {
		yield* this.backend.getNodesTouchingArea(box, minRadius);
	}

	/** Get all nodes in or near a spatial box (according to their radii).
	 * @param box {Box3}
	 * @param minRadius {number}
	 * @returns {AsyncIterable.<NodeRef>}
	 */
	async * getObjectNodesTouchingArea(box, minRadius) {
		yield* this.backend.getObjectNodesTouchingArea(box, minRadius);
	}

	/** Get all edges attached to the specified node.
	 * @param nodeRef {NodeRef}
	 * @returns {AsyncIterable.<DirEdgeRef>} the edges coming from the specified node
	 */
	async * getNodeEdges(nodeRef) {
		yield* this.backend.getNodeEdges(nodeRef.id);
	}

	/** Render Mapper into a div element
	 * @returns {RenderContext}
	 * Example: const renderContext = mapper.render(document.getElementById("mapper_div"))
	 */
	render(element) {
		return new RenderContext(element, this);
	}

	async insertNode(point, nodeType, options) {
		const nodeRef = await this.backend.createNode(options.parent ? options.parent.id : null, nodeType);
		await nodeRef.setCenter(point);
		await nodeRef.setEffectiveCenter(point);
		await nodeRef.setType(options.type);
		await nodeRef.setLayer(this.backend.layerRegistry.get(options.type.getLayer()));
		await nodeRef.setRadius(options.radius);
		await this.hooks.call("insertNode", nodeRef);
		return nodeRef;
	}

	async translateNode(originNodeRef, offset) {
		const nodeRefs = await asyncFrom(originNodeRef.getSelfAndAllDescendants());
		for(const nodeRef of nodeRefs) {
			await nodeRef.setCenter((await nodeRef.getCenter()).add(offset));
			await nodeRef.setEffectiveCenter((await nodeRef.getEffectiveCenter()).add(offset));
		}
		await this.hooks.call("translateNodes", nodeRefs);
	}

	async removeNodes(nodeRefs) {
		let nodeIds = new Set(nodeRefs.map((nodeRef) => nodeRef.id));
		for(const nodeRef of nodeRefs) {
			for await (const childNodeRef of nodeRef.getAllDescendants()) {
				nodeIds.add(childNodeRef.id);
			}
		}

		const nodeRefsWithChildren = Array.from(nodeIds, (nodeId) => this.backend.getNodeRef(nodeId));
		const parentNodeIds = new Set();

		await this.hooks.call("removeNodes", nodeRefsWithChildren);

		for(const nodeRef of nodeRefsWithChildren) {
			const parent = await nodeRef.getParent();
			if(parent && !nodeIds.has(parent.id)) {
				parentNodeIds.add(parent.id);
			}
			await nodeRef.remove();
		}

		for(const nodeId of parentNodeIds) {
			const nodeRef = this.backend.getNodeRef(nodeId);
			if(!(await nodeRef.hasChildren())) {
				await nodeRef.remove();
				nodeRefsWithChildren.push(nodeRef);
			}
		}

		return nodeRefsWithChildren;
	}

	async unremoveNodes(nodeRefs) {
		for(const nodeRef of nodeRefs) {
			await nodeRef.unremove();
			await this.hooks.call("insertNode", nodeRef);
		}
	}

	async removeEdges(edgeRefs) {
		for(const edgeRef of edgeRefs) {
			for await (const nodeRef of edgeRef.getNodes()) {
				await this.hooks.call("updateNode", nodeRef);
			}
			await edgeRef.remove();
		}
	}

	async unremoveEdges(edgeRefs) {
		for(const edgeRef of edgeRefs) {
			await edgeRef.unremove();
			for await (const nodeRef of edgeRef.getNodes()) {
				await this.hooks.call("updateNode", nodeRef);
			}
		}
	}
}

export { Box3, HookContainer, Line3, MapBackend, Mapper, Path, SqlJsMapBackend, Vector3, asyncFrom, dirAngles, dirKeys, dirs, merge, mod, normalizedDirs, version, weightedRandom };
