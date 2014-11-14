#!/usr/bin/env python
# -*- coding: utf-8 -*-
from os.path import join, dirname
import json
import pdb
from traceback import print_exc

def exp_graph(G, jsonfi):
    for k, v in G.node.iteritems():
        if 'size' not in v:
            v['size'] = 10
        if 'group' not in v:
            v['group'] = 0

    dicBig = {}
    #dic0 = [dic for k, dic in G.node.iteritems()]
    #dic0 = G.node.values()
    dicBig['nodes'] = list(G.node.values())

    idx = list(G.node.keys())
    dic1 = []
    for x in G.edge:
        for y in G.edge[x]:
            dic = {'source': idx.index(x), 'target': idx.index(y)}
            for k, v in G.edge[x][y].iteritems():
                dic[k] = v
            dic1.append(dic)
    if len(dic1) > 0:
        dic1.append(dic1[0])
    dicBig['links'] = dic1
    json.dump(dicBig, open(jsonfi, 'wb'))

def exp_as_json(G):
    for k, v in G.node.iteritems():
        if 'size' not in v:
            v['size'] = 10
        if 'group' not in v:
            v['group'] = 0

    dicBig = {}
    dic0 = [dic for k, dic in G.node.iteritems()]
    dicBig['nodes'] = dic0
    idx = list(G.node.keys())
    dic1 = []
    for x in G.edge:
        for y in G.edge[x]:
            dic = {'source': idx.index(x), 'target': idx.index(y)}
            for k, v in G.edge[x][y].iteritems():
                dic[k] = v
            dic1.append(dic)
    if len(dic1) > 0:
        dic1.append(dic1[0])
    dicBig['links'] = dic1
    return json.dumps(dicBig)


