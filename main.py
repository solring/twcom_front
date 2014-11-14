#!/usr/bin/env python
# -*- coding: utf-8 -*-

from pymongo import MongoClient
from flask import Flask, request, redirect, url_for, render_template
import json
from twcom.query import *

host = "106.187.49.17"
port = 27017
user = "reader"
pwd = "twcom"
dbname = "twcom"
url = "mongodb://%s:%s@%s:%d" % (user, pwd, host, port)

db = None
col = None

app = Flask(__name__)

def to_node(d):
    return {"id": d["id"],
            "name": d["name"],
            "market": d["market"] }

@app.route("/")
def mainpage():
    print "main page"
    return render_template('index.html')

@app.route("/search")
def search_dummy():
    return "test search route"

@app.route("/search", methods=['POST'])
def search_byname():
    query = request.form['query']
    print "/search/"+query

    if re.match("^[\d]{8}$", query)!=None:
        return redirect("company/%s" % query)

    results = []
    for data in getidlike(query):
        results.append(data)
    
    if len(results) > 1:
        print "redirect to /company/%s" % results[0]["id"]
        return redirect("company/%s" % results[0]["id"])
    else:
        return "Company not found!"
    #return render_template("index.html")

def build_test_nodes():
    n1 = {"id": 1, "name": "test1"};
    n2 = {"id": 2, "name": "test2"};
    n3 = {"id": 3, "name": "test3"};
    nodes = [n1, n2, n3];
    links = [{"src": n1, "dst": n2},{"src": n2, "dst": n3}];
    result = json.dumps({"nodes": nodes, "links": links});
    return result

@app.route("/company/<cid>.json")
def getJsonById(cid):
    print "getJsonById: %s"  % cid
    
    if cid == 1234:
        return build_test_nodes()

    if col == None:
        return "database collection unavailable."
    

    #data = col.find({ "id" : str(cid) })

    G = get_network(cid, maxlvl=1)
    if G:
        return exp_company(G, "%s.cache" % cid)

@app.route("/company/<cid>")
def show_company(cid):
    
    #if data:
    #    for k, v in data.items():
    #        res += "%s : %s<br>" %(k, v)
    #else:
    #    res += "Cannot find company with id %d" % cid
    return render_template('graph.html', cid=cid)
    


if __name__ == "__main__":
    
    #dbclient = MongoClient(host, port)
    #db = dbclient[dbname]
    #db.authenticate(user, pwd)
    #col = db["cominfo"]
    col = init() # from utils.py
    print "========== data base initialized =========="
    #cols = db.collection_names(include_system_collections=False)

    app.debug = True
    app.run()

