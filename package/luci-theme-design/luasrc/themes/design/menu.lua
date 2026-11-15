-- Copyright 2023 2smile <gngppz@gmail.com>
-- Licensed to the public under the Apache License 2.0.

-- Compatibility helpers that rebuild the legacy Lua dispatcher menu tree
-- from the ucode dispatcher (LuCI 25.12 and later).

local disp = require "luci.dispatcher"

module("luci.themes.design.menu", package.seeall)

local _tree

local FIELDS = {
	"title", "order", "query", "leaf", "ucidata",
	"action", "path", "wildcard", "satisfied"
}

local function convert(n)
	local t = { nodes = {} }

	for _, k in ipairs(FIELDS) do
		t[k] = n[k]
	end

	for name, child in pairs(n.children or {}) do
		t.nodes[name] = convert(child)
	end

	return t
end

-- Whole menu tree, using the node layout expected by the legacy templates.
function tree()
	_tree = _tree or convert(disp.menu_json() or {})
	return _tree
end

-- A single node addressed by its path components.
function node(...)
	local n = tree()

	for i = 1, select("#", ...) do
		n = n.nodes and n.nodes[select(i, ...)]
		if not n then
			return nil
		end
	end

	return n
end

-- Displayable title of a node, or nil when the node has no title.
-- The ucode dispatcher creates intermediate nodes without a title for
-- paths such as "istorenext/..." or wildcard nodes such as "command".
function title(n)
	if type(n) == "table" and type(n.title) == "string" and n.title ~= "" then
		return n.title
	end

	return nil
end

-- Sorted names of all satisfied children of the given node.
function childs(n)
	local rv = {}

	if not (n and n.nodes) then
		return rv
	end

	for name, child in pairs(n.nodes) do
		local title = child.title

		-- The ucode dispatcher auto-creates intermediate nodes for menu
		-- paths such as "istorenext/..." without any title; such nodes are
		-- not displayable menu entries.
		if child.satisfied ~= false and not child.hidden and
		   type(title) == "string" and title ~= "" then
			rv[#rv + 1] = name
		end
	end

	table.sort(rv, function(a, b)
		local oa = tonumber(n.nodes[a].order) or 1000
		local ob = tonumber(n.nodes[b].order) or 1000

		if oa ~= ob then
			return oa < ob
		end

		return tostring(n.nodes[a].title or a) < tostring(n.nodes[b].title or b)
	end)

	return rv
end
