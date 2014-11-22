#!/usr/bin/env python
# -*- coding: utf-8 -*-

#from pymongo import MongoClient
from flask import Flask, request, redirect, url_for, render_template
import json
#from twcom.query import *
import requests
from urllib import unquote

db = None
col = None

app = Flask(__name__)


def getidlike(query):
    return requests.get("http://dataing.pw/query?com=%s" % query)

def getbosslike(query):
    return reqults.get("http://dataing.pw/query?boss=%s" % query)

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
def search_companynet():
    option = request.form['searchopt']
    query = request.form['query']
    print "/search/"+query
    
    if option == "company":
        # search by company id
        if re.match("^[\d]{8}$", query)!=None:
            return redirect("company/id/%s" % query)

        # search by company name
        results = []
        for data in getidlike(query):
            results.append(data)
    
        if len(results) > 1:
            print "redirect to /company/id/%s" % results[0]["id"]
            return redirect("company/id/%s" % results[0]["id"])
        else:
            return "Company not found!"

    elif option == "boss":
        reqults = []


def build_test_nodes():
    n1 = {"id": 1, "name": "test1"};
    n2 = {"id": 2, "name": "test2"};
    n3 = {"id": 3, "name": "test3"};
    nodes = [n1, n2, n3];
    links = [{"src": n1, "dst": n2},{"src": n2, "dst": n3}];
    result = json.dumps({"nodes": nodes, "links": links});
    return result

@app.route("/cors")
def getJson():
    print 'test' 
    #data = col.find({ "id" : str(cid) })
    if 'api' in request.args:
        url = request.args['api']
        print unquote(url)
        data = requests.get(unquote(url))
        return data.json()
    else:
        print "arg error"
#    G = get_network(cid, maxlvl=1)
#    if G:
#        return exp_company(G, "%s.cache" % cid)

@app.route("/company/id/<cid>")
def show_company_byid(cid):
    
    #if data:
    #    for k, v in data.items():
    #        res += "%s : %s<br>" %(k, v)
    #else:
    #    res += "Cannot find company with id %d" % cid
    url = "http://dataing.pw/com?id=%s" % cid
    return render_template('graph.html', cid=cid, url=url)


@app.route("/company/boss/<boss>")
def show_company_byboss(boss):
    url = "http://dataing.pw/com?boss=%s" % boss 
    return render_template('graph.html', cid=boss, url=url)


if __name__ == "__main__":

    #col = init()

    app.debug = True
    print "========== app initialized =========="
    app.run()

