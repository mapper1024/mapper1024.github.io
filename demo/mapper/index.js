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
		await this.clearParentCache();
	}

	async clearParentCache() {
		const parent = await this.getParent();
		if(parent) {
			delete parent.cache.children;
		}
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

		for(const child of children) {
			yield child;
		}
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

	/** Get all edges connected to this node.
	 * @returns {AsyncIterable.<DirEdgeRef>} all the edges, with direction information from this node.
	 */
	async * getEdges() {
		yield* this.backend.getNodeEdges(this.id);
	}

	/** Remove this entity from the database. */
	async remove() {
		await this.clearParentCache();
		return this.backend.removeNode(this.id);
	}

	async unremove() {
		await this.clearParentCache();
		return super.unremove();
	}
}

/** Reference to an edge entity.
 * Do not construct manually, use backend methods. */
class EdgeRef extends EntityRef {
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
		return this.backend.removeEdge(this.id);
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
}

class NodeTypeRegistry {
	constructor() {
		this.types = {};

		this.registerType(new NodeType("water", {
			color: "darkblue",
		}));

		this.registerType(new NodeType("grass", {
			color: "lightgreen",
		}));

		this.registerType(new NodeType("forest", {
			color: "darkgreen",
		}));

		this.registerType(new NodeType("rocks", {
			color: "gray",
		}));

		this.registerType(new NodeType("road", {
			color: "brown",
		}));

		this.registerType(new NodeType("buildings", {
			color: "yellow",
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
	 * @returns {NodeRef}
	 */
	async createNode(parentId) {
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
	 * @returns {AsyncIterable.<NodeRef>}
	 */
	getNodesTouchingArea(box) {
		throw "getNodesTouchingArea not implemented";
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

		this.db.run("PRAGMA foreign_keys = ON");
		this.db.run("PRAGMA recursive_triggers = ON");

		this.db.run("CREATE TABLE IF NOT EXISTS entity (entityid INTEGER PRIMARY KEY, type TEXT, valid BOOLEAN)");

		// Node table and trigger to delete the corresponding entity when a node is deleted.
		this.db.run("CREATE TABLE IF NOT EXISTS node (entityid INT PRIMARY KEY, parentid INT, FOREIGN KEY (entityid) REFERENCES entity(entityid) ON DELETE CASCADE, FOREIGN KEY (parentid) REFERENCES node(entityid) ON DELETE CASCADE)");

		if(this.options.buildDatabase) {
			this.db.run("CREATE TRIGGER IF NOT EXISTS r_nodedeleted AFTER DELETE ON node FOR EACH ROW BEGIN DELETE FROM entity WHERE entityid = OLD.entityid; END");
		}

		// Triggers to cascade invalidation
		if(this.options.buildDatabase) {
			this.db.run("CREATE TRIGGER IF NOT EXISTS r_nodeinvalidated_children AFTER UPDATE OF valid ON entity WHEN NEW.type = 'node' AND NEW.valid = false BEGIN UPDATE entity SET valid = FALSE WHERE entityid IN (SELECT entityid FROM node WHERE parentid = NEW.entityid); END");
			this.db.run("CREATE TRIGGER IF NOT EXISTS r_nodeinvalidated_edges AFTER UPDATE OF valid ON entity WHEN NEW.type = 'node' AND NEW.valid = false BEGIN UPDATE entity SET valid = FALSE WHERE entityid IN (SELECT edgeid FROM edge WHERE nodeid = NEW.entityid); END");
		}

		// Similar to nodes, a edge's corresponding entity will be deleted via trigger as soon as the edge is deleted.
		this.db.run("CREATE TABLE IF NOT EXISTS edge (edgeid INT, nodeid INT, PRIMARY KEY (edgeid, nodeid) FOREIGN KEY (edgeid) REFERENCES entity(entityid) ON DELETE CASCADE, FOREIGN KEY (nodeid) REFERENCES node(entityid) ON DELETE CASCADE)");
		if(this.options.buildDatabase) {
			this.db.run("CREATE TRIGGER IF NOT EXISTS r_edgedeleted AFTER DELETE ON edge FOR EACH ROW BEGIN DELETE FROM entity WHERE entityid = OLD.edgeid; END");
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
		this.s_createNode = this.db.prepare("INSERT INTO node (entityid, parentid) VALUES ($entityId, $parentId)");
		this.s_createConnection = this.db.prepare("INSERT INTO edge (edgeid, nodeid) VALUES ($edgeId, $nodeId)");

		this.s_getNodeParent = this.db.prepare("SELECT nodep.entityid AS parentid FROM node AS nodep INNER JOIN node AS nodec ON nodep.entityid = nodec.parentid INNER JOIN entity ON entity.entityid = nodep.entityid WHERE entity.valid = true AND nodec.entityid = $nodeId");
		this.s_getNodeChildren = this.db.prepare("SELECT node.entityid FROM node INNER JOIN entity ON node.entityid = entity.entityid WHERE parentID = $nodeId AND entity.valid = true");
		this.s_getNodeEdges = this.db.prepare("SELECT edgeid FROM edge INNER JOIN entity ON entity.entityid = edge.edgeid WHERE nodeid = $nodeId AND entity.valid = true");
		this.s_getEdgeNodes = this.db.prepare("SELECT nodeid FROM edge INNER JOIN entity ON nodeid = entity.entityid WHERE edgeid = $edgeId AND entity.valid = true");

		this.s_getEdgeBetween = this.db.prepare("SELECT edge1.edgeid AS edgeid FROM edge edge1 INNER JOIN edge edge2 ON (edge1.edgeid = edge2.edgeid AND edge1.nodeid != edge2.nodeid) WHERE edge1.nodeid = $nodeAId AND edge2.nodeid = $nodeBId");

		this.s_getNodesInArea = this.db.prepare("SELECT node.entityid FROM node INNER JOIN property ON node.entityid = property.entityid INNER JOIN entity ON node.entityid = entity.entityid WHERE entity.valid = TRUE AND property.property = 'center' AND property.x >= $ax AND property.x <= $bx AND property.y >= $ay AND property.y <= $by AND property.z >= $az AND property.z <= $bz");

		this.s_getNodesTouchingArea = this.db.prepare("SELECT node.entityid FROM node INNER JOIN property ON node.entityid = property.entityid INNER JOIN entity ON node.entityid = entity.entityid INNER JOIN property AS radiusproperty ON node.entityid = radiusproperty.entityid WHERE entity.valid = TRUE AND property.property = 'center' AND radiusproperty.property = 'radius' AND property.x >= $ax - radiusproperty.v_number AND property.x <= $bx + radiusproperty.v_number AND property.y >= $ay - radiusproperty.v_number AND property.y <= $by + radiusproperty.v_number AND property.z >= $az - radiusproperty.v_number AND property.z <= $bz + radiusproperty.v_number");

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
		 * @returns {number} The ID of the new node.
		 */
		this.baseCreateNode = (parentId) => {
			this.db.run("BEGIN EXCLUSIVE TRANSACTION");
			const id = this.baseCreateEntity("node");
			this.s_createNode.run({$entityId: id, $parentId: parentId ? parentId : null});
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
			this.s_createConnection.run({$edgeId: id, $nodeId: nodeAId});
			this.s_createConnection.run({$edgeId: id, $nodeId: nodeBId});
			this.db.run("COMMIT");
			return id;
		};

		this.loaded = true;
		await this.hooks.call("loaded");
	}

	async getData() {
		// sql.js must close the database before exporting, but we want to export while the database is open.
		// Easy solution: clone the database manually before exporting.
		const clone = new SqlJsMapBackend({buildDatabase: false});
		await clone.load();

		this.db.run("BEGIN EXCLUSIVE TRANSACTION");

		for(const table of ["entity", "property", "node", "edge"]) {
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

	async createNode(parentId) {
		const nodeRef = this.getNodeRef(this.baseCreateNode(parentId));
		await nodeRef.create();
		return nodeRef;
	}

	async createEdge(nodeAId, nodeBId) {
		return this.getEdgeRef(this.baseCreateEdge(nodeAId, nodeBId));
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

	async * getNodesInArea(box) {
		this.s_getNodesInArea.bind({$ax: box.a.x, $ay: box.a.y, $az: box.a.z, $bx: box.b.x, $by: box.b.y, $bz: box.b.z});
		while(this.s_getNodesInArea.step()) {
			yield this.getNodeRef(this.s_getNodesInArea.get()[0]);
		}
	}

	async * getNodesTouchingArea(box) {
		this.s_getNodesTouchingArea.bind({$ax: box.a.x, $ay: box.a.y, $az: box.a.z, $bx: box.b.x, $by: box.b.y, $bz: box.b.z});
		while(this.s_getNodesTouchingArea.step()) {
			yield this.getNodeRef(this.s_getNodesTouchingArea.get()[0]);
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
		const sizeText = `${this.sizeInMeters() * 2}m`;
		context.fillText(sizeText, position.x - context.measureText(sizeText).width / 2, position.y - 6);

		context.textBaseline = "top";
		const worldPosition = this.context.canvasPointToMap(position).map(c => this.context.mapper.unitsToMeters(c)).round();
		const positionText = `${worldPosition.x}m, ${worldPosition.y}m`;
		context.fillText(positionText, position.x - Math.min(this.getRadius(), context.measureText(positionText).width / 2), position.y + this.getRadius() + 6);
	}

	async draw(context, position) {
		await this.drawAsCircle(context, position);
	}

	async trigger(where, mouseDragEvent) {
	}

	async activate(where) {
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

		for(const action of this.options.actions.reverse()) {
			actions.push(await this.context.performAction(action, false));
		}

		return new BulkAction(this.context, {
			actions: actions,
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
	}

	getUndoAction() {
		return new BulkAction(this.context, {
			actions: this.undoActions.splice(0, this.undoActions.length).reverse(),
		});
	}

	async next(nextPoint) {
		super.next(nextPoint);

		this.undoActions.push(await this.trigger(this.path.asMostRecent()));
	}

	async end(endPoint) {
		super.end(endPoint);

		this.undoActions.push(await this.trigger(this.path.asMostRecent()));

		this.context.pushUndo(this.getUndoAction());
	}

	async trigger(path) {
		return await this.context.brush.trigger(path, this);
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

		const vertices = (await asyncFrom(this.getAllVertices())).sort((a, b) => b.radius - a.radius);

		let count = 0;
		let sum = Vector3.ZERO;

		for(const vertex of vertices) {
			if(!toRemove.has(vertex.nodeRef.id)) {
				count += 1;
				sum = sum.add(vertex.point);
				for(const otherVertex of vertices) {
					if(otherVertex.removable && otherVertex.nodeRef.id !== vertex.nodeRef.id && otherVertex.point.subtract(vertex.point).length() < (vertex.radius + otherVertex.radius) / 4) {
						toRemove.add(otherVertex.nodeRef.id);
					}
				}
			}
		}

		if(await this.options.nodeRef.getRadius() === 0 && count > 0) {
			this.options.nodeRef.setCenter(sum.divideScalar(count));
		}

		return await this.context.performAction(new RemoveAction(this.context, {nodeRefs: [...toRemove].map((id) => this.context.mapper.backend.getNodeRef(id))}), false);
	}

	async * getAllNodes() {
		for await (const nodeRef of this.options.nodeRef.getSelfAndAllDescendants()) {
			if((await nodeRef.getType()).id === this.options.type.id) {
				yield nodeRef;
			}
		}
	}

	async * getAllVertices() {
		for await (const nodeRef of this.getAllNodes()) {
			const radius = await nodeRef.getRadius();
			if(radius > 0) {
				yield {
					nodeRef: nodeRef,
					removable: !(await nodeRef.hasChildren()),
					point: await nodeRef.getCenter(),
					radius: radius,
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
		return this.context.canvasPathToMap(this.options.path).withBisectedLines(this.getRadiusOnMap());
	}

	getRadiusOnMap() {
		return this.context.pixelsToUnits(this.options.radius);
	}

	async perform() {
		const placedNodes = [];

		for(const vertex of this.getPathOnMap().vertices()) {
			placedNodes.push(await this.context.mapper.insertNode(vertex, {
				type: this.options.nodeType,
				radius: this.getRadiusOnMap(),
				parent: this.options.parent,
			}));
		}

		if(this.options.fullCalculation) {
			if(this.options.undoParent) {
				placedNodes.push(this.options.parent);
			}
			await this.context.performAction(new NodeCleanupAction(this.context, {nodeRef: this.options.parent, type: this.options.nodeType}), false);
		}

		return new RemoveAction(this.context, {
			nodeRefs: placedNodes,
		});
	}

	empty() {
		return false;
	}
}

class AddBrush extends Brush {
	constructor(context) {
		super(context);

		this.nodeTypeIndex = 0;
		this.nodeTypes = Array.from(this.context.mapper.backend.nodeTypeRegistry.getTypes());
		this.lastTypeChange = 0;

		this.hooks = new HookContainer();

		this.setNodeTypeIndex(0);
	}

	displayButton(button) {
		button.innerText = "(A)dd";
		button.title = "Add Objects";
	}

	displaySidebar(brushbar, container) {
		const list = document.createElement("ul");
		list.setAttribute("class", "mapper1024_add_brush_strip");
		container.appendChild(list);

		for(const nodeType of this.nodeTypes) {
			const index = this.nodeTypes.indexOf(nodeType);

			const li = document.createElement("li");
			list.appendChild(li);

			const button = document.createElement("canvas");
			li.appendChild(button);

			button.width = brushbar.size.x - 8;
			button.height = brushbar.size.x - 8;

			button.title = nodeType.id;

			const c = button.getContext("2d");
			c.fillStyle = nodeType.def.color;
			c.fillRect(0, 0, button.width, button.height);

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

	async trigger(path, mouseDragEvent) {
		const drawPathActionOptions = {
			path: path,
			radius: this.getRadius(),
			nodeType: this.getNodeType(),
			fullCalculation: mouseDragEvent.done,
			parent: this.parentNode,
			undoParent: this.undoParent,
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
			this.parentNode = await this.context.mapper.insertNode(this.context.canvasPointToMap(where), {
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
			if(this.context.mapPointToCanvas((await nodeRef.getCenter())).subtract(brushPosition).length() <= this.getRadius() && await nodeRef.getPNumber("radius") > 0) {
				yield nodeRef;
			}
		}
	}

	async draw(context, position) {
		if(this.context.isKeyDown("Control") || this.sizeRecentlyChanged()) {
			await this.drawAsCircle(context, position);
		}
	}

	async triggerAtPosition(brushPosition) {
		let toRemove;

		if(this.context.isKeyDown("Control")) {
			toRemove = await asyncFrom(this.getNodesInBrush(brushPosition));
		}
		else {
			let selection;

			if(this.context.isKeyDown("Shift")) {
				selection = await Selection.fromNodeIds(this.context, this.context.hoverSelection.parentNodeIds);
			}
			else {
				selection = this.context.hoverSelection;
			}

			toRemove = Array.from(selection.getOrigins());
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

	async trigger(path) {
		const action = await this.triggerOnPath(path);
		const undoAction = await this.context.performAction(action);
		return undoAction;
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
		if(!this.context.hoveringOverSelection()) {
			if(this.context.hoverSelection.exists()) {
				let newSelection = null;

				if(this.context.isKeyDown("Shift")) {
					newSelection = await Selection.fromNodeIds(this.context, this.context.hoverSelection.parentNodeIds);
				} else {
					newSelection = this.context.hoverSelection;
				}

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

		if(this.context.hoveringOverSelection()) {
			return new TranslateEvent(this.context, where, Array.from(this.context.selection.getOrigins()));
		}
		else {
			this.context.selection = new Selection(this, []);
		}
	}
}

class PanEvent extends DragEvent {
	next(nextPoint) {
		super.next(nextPoint);
		this.context.setScrollOffset(this.context.scrollOffset.subtract(this.path.lastLine().vector()));
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

class Tile {
	constructor(megaTile, corner) {
		this.context = megaTile.context;
		this.megaTile = megaTile;
		this.nearbyNodes = new Map();
		this.corner = corner;

		this.closestNodeRef = null;
		this.closestNodeType = null;
		this.closestNodeDistance = Infinity;
		this.closestNodeRadiusInUnits = Infinity;
		this.closestNodeIsOverpowering = false;
	}

	getCenter() {
		return this.corner.add(Tile.HALF_SIZE_VECTOR);
	}

	getMegatileCenterPosition() {
		return this.getMegaTilePosition().add(Tile.HALF_SIZE_VECTOR);
	}

	getMegaTilePosition() {
		return this.corner.map((v) => mod(v, MegaTile.SIZE));
	}

	getTilePosition() {
		return this.corner.map((v) => Math.floor(v / Tile.SIZE));
	}

	async addNode(nodeRef) {
		const nodeCenter = (await nodeRef.getCenter()).map((a) => this.context.unitsToPixels(a));
		const distance = nodeCenter.subtract(this.getCenter()).length();
		const nodeRadiusInUnits = await nodeRef.getRadius();
		const nodeRadiusInPixels = this.context.unitsToPixels(nodeRadiusInUnits);
		if(distance <= nodeRadiusInPixels + Tile.SIZE / 2 && nodeRadiusInPixels >= Tile.SIZE / 8) {
			this.nearbyNodes.set(nodeRef.id, nodeRef);
			this.megaTile.addNode(nodeRef.id);

			if(distance < this.closestNodeDistance && nodeRadiusInUnits <= this.closestNodeRadiusInUnits) {
				this.closestNodeRef = nodeRef;
				this.closestNodeRadiusInUnits = nodeRadiusInUnits;
				this.closestNodeType = await nodeRef.getType();
				this.closestNodeIsOverpowering = distance < nodeRadiusInPixels - Tile.SIZE / 2;
			}

			return true;
		}
		else {
			return false;
		}
	}

	* getNearbyNodes() {
		yield* this.nearbyNodes.values();
	}

	* getNeighborTiles() {
		const origin = this.getTilePosition();
		for(const dirName of dirKeys) {
			const dir = dirs[dirName];
			const otherTilePosition = origin.add(dir);
			const otherTileX = this.context.tiles[otherTilePosition.x];
			let otherTile;
			if(otherTileX) {
				otherTile = otherTileX[otherTilePosition.y];
			}
			yield [dirName, dir, otherTile];
		}
	}

	async render() {
		const position = this.getMegaTilePosition();

		const key = [this.closestNodeType.id];

		if(!this.closestNodeIsOverpowering) {
			for(const [dirName, dir, otherTile] of this.getNeighborTiles()) {
				const otherType = (otherTile && otherTile.closestNodeType) ? otherTile.closestNodeType.id : "null";
				key.push(otherType);
			}
		}

		const keyString = key.join(" ");
		const tileRenders = this.context.tileRenders;
		let canvas = tileRenders[keyString];

		if(canvas === undefined) {
			canvas = document.createElement("canvas");
			canvas.width = Tile.SIZE;
			canvas.height = Tile.SIZE;

			let neighbors;

			if(!this.closestNodeIsOverpowering) {
				neighbors = {};

				for(const [dirName, dir, otherTile] of this.getNeighborTiles()) {
					neighbors[dirName] = {
						dir: dir,
						type: (otherTile && otherTile.closestNodeType) ? otherTile.closestNodeType : null,
					};
				}
			}

			await Tile.renderMaster(canvas, this.closestNodeType, neighbors);
			tileRenders[keyString] = canvas;
		}

		this.megaTile.canvasContext.drawImage(canvas, position.x, position.y);
	}

	static async renderMaster(canvas, type, neighbors) {
		const c = canvas.getContext("2d");

		const colors = {
			grass: ["green", "forestgreen", "mediumseagreen", "seagreen"],
			water: ["deepskyblue", "darkblue", "seagreen"],
			forest: ["darkgreen", "forestgreen", "darkseagreen", "olivedrab"],
			rocks: ["slategray", "black", "gray", "lightslategray", "darkgray"],
			road: ["brown", "darkgoldenrod", "olive", "tan", "wheat", "sandybrown"],
			buildings: ["yellow", "sandybrown", "darkgoldenrod", "gold", "orange"],
			null: ["black", "darkgray", "darkseagreen"],
		};

		const pixelSizes = {
			grass: 1,
			water: 1,
			forest: 2,
			rocks: 2,
		};

		function getTypeColors(type) {
			const acolors = colors[type.id];
			return acolors || [type.def.color];
		}

		function getOurColors() {
			return getTypeColors(type);
		}

		const ourColors = getOurColors();
		const pixelSize = pixelSizes[type.id] || 2;
		const hasNeighbors = !!neighbors;

		for(let x = 0; x < canvas.width; x += pixelSize) {
			for(let y = 0; y < canvas.height; y += pixelSize) {
				let ucolors;

				if(hasNeighbors) {
					const pxv = (new Vector3(x, y, 0)).subtract(Tile.HALF_SIZE_VECTOR).divideScalar(Tile.SIZE);

					let neighborColors = ourColors;
					let closestDistance = Infinity;

					for(const dirName of dirKeys) {
						const distance = dirs[dirName].subtract(pxv).length();
						if(closestDistance > distance) {
							const neighborType = neighbors[dirName].type;
							neighborColors = neighborType ? getTypeColors(neighborType) : colors["null"];
							closestDistance = distance;
						}
					}

					ucolors = Math.random() < closestDistance ? ourColors : neighborColors;
				}
				else {
					ucolors = ourColors;
				}

				c.fillStyle = ucolors[Math.floor(Math.random() * ucolors.length)];
				c.fillRect(x, y, pixelSize, pixelSize);
			}
		}
	}
}

Tile.SIZE = 16;
Tile.HALF_SIZE_VECTOR = new Vector3(Tile.SIZE / 2, Tile.SIZE / 2, 0);

class MegaTile {
	constructor(context, point) {
		this.point = point;
		this.context = context;
		this.nearbyNodeIds = new Set();
		this.needRedraw = new Set();
		this.clean = true;

		this.canvas = document.createElement("canvas");
		this.canvas.width = MegaTile.SIZE;
		this.canvas.height = MegaTile.SIZE;
		this.canvasContext = this.canvas.getContext("2d");
	}

	makeTile(point) {
		return new Tile(this, point);
	}

	reset() {
		if(!this.clean) {
			this.clean = true;
			for(const nodeId of this.nearbyNodeIds) {
				this.needRedraw.add(nodeId);
			}
			const c = this.canvas.getContext("2d");
			c.beginPath();
			c.rect(0, 0, this.canvas.width, this.canvas.height);
			c.fillStyle = this.context.backgroundColor;
			c.fill();
		}
	}

	addNode(nodeId) {
		this.nearbyNodeIds.add(nodeId);
		this.clean = false;
	}

	removeNode(nodeId) {
		this.nearbyNodeIds.delete(nodeId);
		this.reset();
	}

	popRedraw() {
		const needRedraw = this.needRedraw;
		this.needRedraw = new Set();
		return needRedraw;
	}
}

MegaTile.SIZE = Tile.SIZE * 8;

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
				size.innerText = `Radius ${brush.sizeInMeters()}m`;
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

		this.brushStrip = document.createElement("span");

		this.recalculate();

		this.context.hooks.add("size_change", this.recalculate.bind(this));
		this.context.hooks.add("changed_brush", (brush) => {
			this.brushStrip.remove();
			this.brushStrip = document.createElement("div");
			this.brushStrip.setAttribute("class", "mapper1024_brush_strip");
			brush.displaySidebar(this, this.brushStrip);
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
let version = "0.1.8";

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

		this.wantRecheckSelection = true;
		this.wantUpdateSelection = true;

		this.undoStack = [];
		this.redoStack = [];

		this.tiles = {};
		this.megaTiles = {};
		this.drawnNodeIds = new Set();
		this.offScreenDrawnNodeIds = new Set();
		this.drawnTiles = [];
		this.nodeIdToTiles = {};

		this.backgroundColor = "#997";

		this.pressedKeys = {};
		this.mouseDragEvents = {};
		this.oldMousePosition = Vector3.ZERO;
		this.mousePosition = Vector3.ZERO;

		this.debugMode = false;

		this.scrollDelta = 0;

		this.scrollOffset = Vector3.ZERO;
		this.zoom = 5;
		this.requestedZoom = 5;

		this.brushes = {
			add: new AddBrush(this),
			select: new SelectBrush(this),
			"delete": new DeleteBrush(this),
		};

		this.brush = this.brushes.add;

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

		this.mapper.hooks.add("updateNode", (nodeRef) => this.recalculateTilesNodeUpdate(nodeRef));
		this.mapper.hooks.add("removeNodes", (nodeRefs) => this.recalculateTilesNodesRemove(nodeRefs));
		this.mapper.hooks.add("translateNodes", (nodeRefs) => this.recalculateTilesNodesTranslate(nodeRefs));
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

		this.canvas.addEventListener("mousemove", (event) => {
			this.oldMousePosition = this.mousePosition;
			this.mousePosition = new Vector3(event.x, event.y, 0);

			for(const button in this.mouseDragEvents) {
				const mouseDragEvent = this.mouseDragEvents[button];
				mouseDragEvent.next(this.mousePosition);
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
					asyncFrom(this.drawnNodes()).then((drawnNodes) => {
						this.scrollOffset = Vector3.ZERO;
						this.forceZoom(5);
						this.recalculateTilesNodesTranslate(drawnNodes);
					});
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
			else if(event.key === "d") {
				this.changeBrush(this.brushes["delete"]);
			}
			else if(event.key === "a") {
				this.changeBrush(this.brushes.add);
			}
			else if(event.key === "s") {
				this.changeBrush(this.brushes.select);
			}
			else if(event.key === "`") {
				this.debugMode = !this.debugMode;
			}
			else if(event.key === "n") {
				const nodeRef = await this.hoverSelection.getParent();
				if(nodeRef) {
					const where = (await this.getNamePosition(nodeRef)).where;

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

		this.tileRenders = {};

		// Watch the parent resize so we can keep our canvas filling the whole thing.
		this.parentObserver = new ResizeObserver(() => this.recalculateSize());
		this.parentObserver.observe(this.parent);

		this.recalculateSize();

		setTimeout(this.redrawLoop.bind(this), 10);
		setTimeout(this.recalculateLoop.bind(this), 10);
		setTimeout(this.recalculateSelection.bind(this), 10);
		setTimeout(this.applyZoom.bind(this), 10);

		this.changeBrush(this.brushes.add);
	}

	isPanning() {
		return this.mouseDragEvents[2] instanceof PanEvent;
	}

	setScrollOffset(value) {
		this.scrollOffset = value;
		this.recalculateTilesViewport();
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

	async getNamePosition(nodeRef) {
		const screenBox = this.screenBox();

		const optimal = (await nodeRef.getCenter()).map((v) => this.unitsToPixels(v));
		let best = null;

		const selection = await Selection.fromNodeRefs(this, [nodeRef]);

		let tileCount = 0;
		for(const tile of this.drawnTiles) {
			if(tile.closestNodeRef && selection.hasNodeRef(tile.closestNodeRef)) {
				const tileCenter = tile.getCenter();
				const drawnTileCenter = tileCenter.subtract(this.scrollOffset);
				if(drawnTileCenter.x >= screenBox.a.x && drawnTileCenter.x <= screenBox.b.x && drawnTileCenter.y >= screenBox.a.y && drawnTileCenter.y <= screenBox.b.y) {
					tileCount++;
					if(!best || tileCenter.subtract(optimal).lengthSquared() < best.subtract(optimal).lengthSquared()) {
						best = tileCenter;
					}
				}
			}
		}

		return {
			size: Math.min(24, tileCount * 4),
			where: (best || optimal).subtract(this.scrollOffset)
		};
	}

	requestZoomChange(zoom) {
		this.requestedZoom = Math.max(1, Math.min(zoom, 20));
	}

	async applyZoom() {
		if(this.zoom !== this.requestedZoom) {
			asyncFrom(this.drawnNodes()).then((drawnNodes) => {
				const oldLandmark = this.canvasPointToMap(this.mousePosition);
				this.zoom = this.requestedZoom;
				this.hooks.call("changed_zoom", this.zoom);
				const newLandmark = this.canvasPointToMap(this.mousePosition);
				this.scrollOffset = this.scrollOffset.add(this.mapPointToCanvas(oldLandmark).subtract(this.mapPointToCanvas(newLandmark)));
				this.recalculateTilesNodesTranslate(drawnNodes);
			});
		}

		if(this.alive) {
			setTimeout(this.applyZoom.bind(this), 10);
		}
	}

	forceZoom(zoom) {
		this.zoom = this.requestedZoom = zoom;
		this.hooks.call("changed_zoom", this.zoom);
		this.recalculateTilesViewport();
	}

	async redrawLoop() {
		if(this.wantRedraw) {
			this.wantRedraw = false;
			await this.redraw();
		}

		if(this.alive) {
			setTimeout(this.redrawLoop.bind(this), 10);
		}
	}

	async recalculateSelection() {
		if(this.wantRecheckSelection) {
			this.wantRecheckSelection = false;
			const closestNodeRef = await this.getClosestNodeRef(this.mousePosition);
			if(closestNodeRef) {
				this.hoverSelection = await Selection.fromNodeRefs(this, [closestNodeRef]);
			}
			else {
				this.hoverSelection = new Selection(this, []);
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

	async getClosestNodeRef(canvasPosition) {
		let closestNodeRef = null;
		let closestDistanceSquared = null;
		for await (const nodeRef of this.drawnNodes()) {
			const center = this.mapPointToCanvas(await nodeRef.getCenter());
			const distanceSquared = center.subtract(canvasPosition).lengthSquared();
			if((!closestDistanceSquared || distanceSquared <= closestDistanceSquared) && distanceSquared < this.unitsToPixels(await nodeRef.getRadius()) ** 2) {
				closestNodeRef = nodeRef;
				closestDistanceSquared = distanceSquared;
			}
		}
		return closestNodeRef;
	}

	async recalculateLoop() {
		if(this.recalculateViewport || this.recalculateUpdate.length > 0 || this.recalculateRemoved.length > 0 || this.recalculateTranslated.length > 0) {
			this.recalculateViewport = false;
			await this.recalculateTiles(this.recalculateUpdate.splice(0, this.recalculateUpdate.length), this.recalculateRemoved.splice(0, this.recalculateRemoved.length), this.recalculateTranslated.splice(0, this.recalculateTranslated.length));
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
		this.wantRecheckSelection = true;
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

	canvasPathToMap(path) {
		return path.mapOrigin((origin) => this.canvasPointToMap(origin)).mapLines((v) => v.map((a) => this.pixelsToUnits(a)));
	}

	pixelsToUnits(pixels) {
		return pixels * this.zoom;
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

	screenBoxTiles() {
		const offsetScreenBox = this.screenBox().map((v) => v.add(this.scrollOffset));
		return new Box3(offsetScreenBox.a.map((c) => Math.floor(c / Tile.SIZE)), offsetScreenBox.b.map((c) => Math.ceil(c / Tile.SIZE)));
	}

	/** Recalculate the UI size based on the parent.
	 * This requires a full redraw.
	 */
	recalculateSize() {
		// Keep the canvas matching the parent size.
		this.canvas.width = this.parent.clientWidth;
		this.canvas.height = this.parent.clientHeight;

		this.hooks.call("size_change");

		this.recalculateTilesViewport();
	}

	recalculateTilesViewport() {
		this.recalculateViewport = true;
	}

	recalculateTilesNodeUpdate(nodeRef) {
		this.recalculateUpdate.push(nodeRef);
	}

	recalculateTilesNodesRemove(nodeRefs) {
		this.recalculateRemoved.push(...nodeRefs);
	}

	recalculateTilesNodesTranslate(nodeRefs) {
		this.recalculateTranslated.push(...nodeRefs);
	}

	async recalculateTiles(updatedNodeRefs, removedNodeRefs, translatedNodeRefs) {
		const actualTiles = new Set();

		const updatedNodeIds = new Set([...updatedNodeRefs, ...translatedNodeRefs].map((nodeRef) => nodeRef.id));
		const removedNodeIds = new Set(removedNodeRefs.map((nodeRef) => nodeRef.id));
		const translatedNodeIds = new Set(translatedNodeRefs.map((nodeRef) => nodeRef.id));

		const visibleNodeIds = new Set(await asyncFrom(this.visibleNodes(), (nodeRef) => nodeRef.id));

		const screenBoxTiles = this.screenBoxTiles();

		for(const nodeId of visibleNodeIds) {
			if(!this.drawnNodeIds.has(nodeId) || this.offScreenDrawnNodeIds.has(nodeId)) {
				updatedNodeIds.add(nodeId);
			}
		}

		const cleared = new Set();
		const clearedTiles = new Set();

		const clearNodeTilesRecheck = (nodeId) => {
			if(cleared.has(nodeId)) {
				return;
			}
			cleared.add(nodeId);
			const tX = this.nodeIdToTiles[nodeId];
			for(const x in tX) {
				const withinX = x >= screenBoxTiles.a.x && x <= screenBoxTiles.b.x;
				const tY = this.nodeIdToTiles[nodeId][x];
				for(const y in tY) {
					const tile = tY[y];
					if(!clearedTiles.has(tile) && tile.closestNodeRef.id === nodeId) {
						clearedTiles.add(tile);
						const withinY = y >= screenBoxTiles.a.y && y <= screenBoxTiles.b.y;
						const megaTile = tile.megaTile;
						delete this.tiles[x][y];
						megaTile.removeNode(nodeId);
						if(withinX && withinY) {
							for(const nodeId of megaTile.popRedraw()) {
								updatedNodeIds.add(nodeId);
							}
							updatedNodeIds.add(tile.closestNodeRef.id);
						}
					}
				}
			}
		};

		for(const removedId of new Set([...removedNodeIds, ...translatedNodeIds])) {
			clearNodeTilesRecheck(removedId);
			delete this.nodeIdToTiles[removedId];
			this.drawnNodeIds.delete(removedId);
			this.offScreenDrawnNodeIds.delete(removedId);
		}

		for(const nodeId of updatedNodeIds) {
			if(visibleNodeIds.has(nodeId)) {
				const nodeRef = this.mapper.backend.getNodeRef(nodeId);

				this.drawnNodeIds.add(nodeId);

				if(this.nodeIdToTiles[nodeRef.id] === undefined) {
					this.nodeIdToTiles[nodeRef.id] = {};
				}

				const nodeIdToTiles = this.nodeIdToTiles[nodeRef.id];

				const center = (await nodeRef.getCenter()).map((a) => this.unitsToPixels(a));
				const centerTile = center.divideScalar(Tile.SIZE).round();
				const radius = this.unitsToPixels(await nodeRef.getRadius());
				if(radius >= Tile.SIZE / 8) {

					const radiusTile = Math.ceil(radius / Tile.SIZE);

					const cxn = centerTile.x - radiusTile;
					const cyn = centerTile.y - radiusTile;
					const cxp = centerTile.x + radiusTile;
					const cyp = centerTile.y + radiusTile;

					const tileBox = new Box3(
						new Vector3(Math.max(screenBoxTiles.a.x, cxn), Math.max(screenBoxTiles.a.y, cyn), 0),
						new Vector3(Math.min(screenBoxTiles.b.x, cxp), Math.min(screenBoxTiles.b.y, cyp), 0)
					);

					if(tileBox.a.x !== cxn || tileBox.a.y !== cyn || tileBox.b.x !== cxp || tileBox.b.y !== cyp) {
						this.offScreenDrawnNodeIds.add(nodeId);
					}
					else {
						this.offScreenDrawnNodeIds.delete(nodeId);
					}

					for(let x = tileBox.a.x; x <= tileBox.b.x; x++) {
						if(this.tiles[x] === undefined) {
							this.tiles[x] = {};
						}
						if(nodeIdToTiles[x] === undefined) {
							nodeIdToTiles[x] = {};
						}
						const nodeIdToTileX = nodeIdToTiles[x];
						const tilesX = this.tiles[x];
						const megaTilePositionX = Math.floor(x / MegaTile.SIZE * Tile.SIZE);

						if(this.megaTiles[megaTilePositionX] === undefined) {
							this.megaTiles[megaTilePositionX] = {};
						}

						const mtX = this.megaTiles[megaTilePositionX];
						for(let y = tileBox.a.y; y <= tileBox.b.y; y++) {
							const megaTilePositionY = Math.floor(y / MegaTile.SIZE * Tile.SIZE);

							if(mtX[megaTilePositionY] === undefined) {
								mtX[megaTilePositionY] = new MegaTile(this, new Vector3(megaTilePositionX, megaTilePositionY, 0).multiplyScalar(MegaTile.SIZE));
							}

							const megaTile = mtX[megaTilePositionY];

							if(tilesX[y] === undefined) {
								tilesX[y] = megaTile.makeTile(new Vector3(x * Tile.SIZE, y * Tile.SIZE, 0));
							}

							const tile = tilesX[y];

							if(await tile.addNode(nodeRef)) {
								nodeIdToTileX[y] = tile;
								actualTiles.add(tile);
							}
						}
					}
				}
			}
		}

		for(const tile of actualTiles) {
			await tile.render();
		}

		this.drawnTiles = Array.from(this.freshDrawnTiles());

		this.requestRedraw();
	}

	async drawTiles() {
		const c = this.canvas.getContext("2d");
		const tiles = this.megaTiles;

		for (const x in tiles) {
			const tilesX = tiles[x];
			for (const y in tilesX) {
				const tile = tilesX[y];
				const point = tile.point.subtract(this.scrollOffset);

				c.drawImage(tile.canvas, point.x, point.y);
			}
		}
	}

	async drawSelection() {
		const c = this.canvas.getContext("2d");
		const toDraw = {};

		for await (const nodeRef of this.drawnNodes()) {
			const inSelection = this.selection.hasNodeRef(nodeRef);
			const inHoverSelection = this.hoverSelection.hasNodeRef(nodeRef);
			const sibling = this.hoverSelection.nodeRefIsSibling(nodeRef) || this.selection.nodeRefIsSibling(nodeRef);
			const notSibling = (inSelection && !this.selection.nodeRefIsSibling(nodeRef)) || (inHoverSelection && !this.hoverSelection.nodeRefIsSibling(nodeRef));
			const alpha = (sibling && !notSibling) ? 0.25 : 0.75;

			if(inSelection || inHoverSelection) {
				const nodeTiles = this.nodeIdToTiles[nodeRef.id];
				if(nodeTiles !== undefined) {
					for(const x in nodeTiles) {
						const tX = nodeTiles[x];
						if(toDraw[x] === undefined) {
							toDraw[x] = new Set();
						}
						const tDX = toDraw[x];
						for(const y in tX) {
							const tile = tX[y];
							if(tDX[y] === undefined) {
								tDX[y] = {
									tile: tile,
									alpha: alpha,
								};
							}
							else {
								tDX[y].alpha = Math.max(tDX[y].alpha, alpha);
							}
							tDX[y].inSelection = tDX[y].inSelection || inSelection;
							tDX[y].inHoverSelection = tDX[y].inHoverSelection || inHoverSelection;
						}
					}
				}
			}

			c.globalAlpha = 1;
		}

		const dirs = {};
		dirs.north = new Vector3(0, -1, 0);
		dirs.south = new Vector3(0, 1, 0);
		dirs.east = new Vector3(1, 0, 0);
		dirs.west = new Vector3(-1, 0, 0);

		const lines = {};
		lines.north = new Line3(new Vector3(0, 0, 0), new Vector3(1, 0, 0));
		lines.south = new Line3(new Vector3(0, 1, 0), new Vector3(1, 1, 0));
		lines.west = new Line3(new Vector3(0, 0, 0), new Vector3(0, 1, 0));
		lines.east = new Line3(new Vector3(1, 0, 0), new Vector3(1, 1, 0));

		for(const line in lines) {
			lines[line] = lines[line].multiplyScalar(Tile.SIZE);
		}

		function dirNeighbor(x, y, dir) {
			const nx = x + dir.x;
			const ny = y + dir.y;
			return (toDraw[nx] && toDraw[nx][ny]) ? toDraw[nx][ny] : null;
		}

		const drawLine = (t, line, dir, inset) => {
			const point = t.tile.corner.subtract(this.scrollOffset);
			const actualLine = line.add(point).add(dir.multiplyScalar(-inset));
			c.beginPath();
			c.moveTo(actualLine.a.x, actualLine.a.y);
			c.lineTo(actualLine.b.x, actualLine.b.y);

			const gradient = c.createLinearGradient(actualLine.a.x, actualLine.a.y, actualLine.b.x, actualLine.b.y);
			gradient.addColorStop(0, "white");
			gradient.addColorStop(0.25, "black");
			gradient.addColorStop(0.75, "white");
			gradient.addColorStop(1, "black");

			c.strokeStyle = gradient;
			c.stroke();
		};

		c.lineWidth = 2;

		for(const x in toDraw) {
			const tX = toDraw[x];
			for(const y in tX) {
				const t = tX[y];

				c.globalAlpha = t.alpha;

				for(const dirName in dirs) {
					const dir = dirs[dirName];
					const n = dirNeighbor(+x, +y, dir);
					if(t.inSelection && (!n || !n.inSelection || n.alpha != t.alpha)) {
						drawLine(t, lines[dirName], dir, 0);
					}

					if(t.inHoverSelection && (!n || !n.inHoverSelection || n.alpha != t.alpha)) {
						drawLine(t, lines[dirName], dir, 2);
					}
				}
			}
		}

		c.lineWidth = 1;
		c.globalAlpha = 1;
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

	async drawLabels() {
		const c = this.canvas.getContext("2d");
		c.textBaseline = "top";
		for await (const nodeRef of this.drawnNodes()) {
			const name = await nodeRef.getPString("name");
			if(name !== undefined) {
				const position = await this.getNamePosition(nodeRef);
				const selected = (this.selection.hasNodeRef(nodeRef) || this.hoverSelection.hasNodeRef(nodeRef));
				const size = selected ? 24 : position.size;
				if(size > 0) {
					c.font = selected ? `bold ${size}px serif` : `${size}px serif`;
					const measure = c.measureText(name);
					const height = Math.abs(measure.actualBoundingBoxAscent) + Math.abs(measure.actualBoundingBoxDescent);
					const where = position.where.subtract(new Vector3(measure.width / 2, height / 2, 0, 0));
					c.globalAlpha = 0.25;
					c.fillStyle = "black";
					c.fillRect(where.x, where.y, measure.width, height);
					c.globalAlpha = 1;
					c.fillStyle = "white";
					c.fillText(name, where.x, where.y);
				}
			}
		}
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

		infoLine("Change brush mode with (A)dd, (S)elect or (D)elete. ");

		// Debug help
		infoLine("You can (N)ame the selected object. Scroll to zoom.");
		if(this.brush instanceof AddBrush) {
			infoLine("Click to add terrain");
			infoLine("Hold Q while scrolling to change brush terrain/type; hold W while scrolling to change brush size.");
		}
		else if(this.brush instanceof SelectBrush) {
			infoLine("Click to select, drag to move.");
			infoLine("Hold Shift to select an entire object, hold Control to add to an existing selection.");
		}
		else if(this.brush instanceof DeleteBrush) {
			infoLine("Click to delete. Hold Shift to delete an entire object.");
			infoLine("Hold Control to delete all objects inside the brush. Hold W while scrolling to change brush size.");
		}
		infoLine("Right click or arrow keys to move map. Ctrl+C to return to center. Ctrl+Z is undo, Ctrl+Y is redo. ` to toggle debug mode.");

		await this.hooks.call("draw_help", {
			infoLine: infoLine,
		});

		if(this.debugMode) {
			infoLine(`${Object.keys(this.tileRenders).length} cached tiles | ${this.drawnNodeIds.size} drawn nodes, ${this.offScreenDrawnNodeIds.size} on border`);
		}
	}

	async drawDebug() {
		const c = this.canvas.getContext("2d");
		for await (const nodeRef of this.drawnNodes()) {
			const position = this.mapPointToCanvas(await nodeRef.getCenter());
			c.beginPath();
			c.arc(position.x, position.y, 4, 0, 2 * Math.PI, false);
			c.strokeStyle = "white";
			c.stroke();
		}
	}

	async drawScale() {
		const c = this.canvas.getContext("2d");
		const barHeight = 10;
		const barWidth = this.canvas.width / 5 - mod(this.canvas.width / 5, this.unitsToPixels(this.mapper.metersToUnits(100 * 5)));
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

	/** Completely redraw the displayed UI. */
	async redraw() {
		await this.clearCanvas();

		await this.drawTiles();
		if(!this.isPanning()) {
			await this.drawSelection();
			await this.drawLabels();
		}
		await this.drawBrush();

		await this.drawHelp();
		await this.drawScale();

		if(this.debugMode) {
			await this.drawDebug();
		}

		await this.drawVersion();
	}

	async * visibleNodes() {
		const screenBox = this.screenBox();
		yield* this.mapper.getNodesTouchingArea(screenBox.map((v) => this.canvasPointToMap(v)));
	}

	async * drawnNodes() {
		for(const nodeId of this.drawnNodeIds) {
			yield this.mapper.backend.getNodeRef(nodeId);
		}
	}

	async * offScreenDrawnNodes() {
		for(const nodeId of this.offScreenDrawnNodeIds) {
			yield this.mapper.backend.getNodeRef(nodeId);
		}
	}

	* freshDrawnTiles() {
		const corner = this.scrollOffset.divideScalar(Tile.SIZE).map((v) => Math.floor(v));
		const end = this.scrollOffset.add(this.screenSize()).divideScalar(Tile.SIZE).map((v) => Math.ceil(v));

		const tX = this.tiles;
		for(let x = corner.x; x <= end.x; x++) {
			const tY = tX[x];
			if(tY) {
				for(let y = corner.y; y <= end.y; y++) {
					const tile = tY[y];
					if(tile) {
						yield tile;
					}
				}
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

	/** Get all nodes inside a specified spatial box.
	 * @param box {Box3}
	 * @returns {AsyncIterable.<NodeRef>}
	 */
	async * getNodesInArea(box) {
		yield* this.backend.getNodesInArea(box);
	}

	/** Get all nodes in or near a spatial box (according to their radii).
	 * @param box {Box3}
	 * @returns {AsyncIterable.<NodeRef>}
	 */
	async * getNodesTouchingArea(box) {
		yield* this.backend.getNodesTouchingArea(box);
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

	async insertNode(point, options) {
		const nodeRef = await this.backend.createNode(options.parent ? options.parent.id : null);
		await nodeRef.setCenter(point);
		await nodeRef.setType(options.type);
		await nodeRef.setRadius(options.radius);
		// TODO: connect nodes
		//await this.connectNode(nodeRef, this.options);
		await this.hooks.call("insertNode", nodeRef);
		return nodeRef;
	}

	async translateNode(originNodeRef, offset) {
		const nodeRefs = await asyncFrom(originNodeRef.getSelfAndAllDescendants());
		for(const nodeRef of nodeRefs) {
			await nodeRef.setCenter((await nodeRef.getCenter()).add(offset));
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

		await this.hooks.call("removeNodes", nodeRefsWithChildren);
		for(const nodeRef of nodeRefsWithChildren) {
			await nodeRef.remove();
		}

		return nodeRefsWithChildren;
	}

	async unremoveNodes(nodeRefs) {
		for(const nodeRef of nodeRefs) {
			await nodeRef.unremove();
			await this.hooks.call("insertNode", nodeRef);
		}
	}

	async connectNode(nodeRef, options) {
		await this.connectNodeToParent(nodeRef);
		await this.connectNodeToNearbyNodes(nodeRef, options);
		await this.cleanNodeConnectionsAround(nodeRef, options);
	}

	async connectNodeToParent(nodeRef) {
	}

	async connectNodeToNearbyNodes(nodeRef, options) {
		for (const otherNodeRef of await asyncFrom(this.backend.getNearbyNodes(nodeRef, options.blendDistance))) {
			await this.backend.createEdge(nodeRef.id, otherNodeRef.id);
		}
	}

	async cleanNodeConnectionsAround(nodeRef, options) {

		const removed = {};

		for (const dirEdgeRef of await asyncFrom(this.backend.getNodeEdges(nodeRef.id))) {
			if(!removed[dirEdgeRef.id]) {
				for (const intersectingEdgeRef of await asyncFrom(this.backend.getIntersectingEdges(dirEdgeRef, options.blendDistance))) {
					if((await dirEdgeRef.getLine()).distanceSquared() < (await intersectingEdgeRef.getLine()).distanceSquared()) {
						intersectingEdgeRef.remove();
						removed[intersectingEdgeRef.id] = true;
					}
					else {
						dirEdgeRef.remove();
						break;
					}
				}
			}
		}
	}
}

export { Box3, HookContainer, Line3, MapBackend, Mapper, Path, SqlJsMapBackend, Vector3, asyncFrom, merge, mod, version };
