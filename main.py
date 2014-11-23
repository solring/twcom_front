#!/usr/bin/env python
# -*- coding: utf-8 -*-

#from pymongo import MongoClient
from flask import Flask, request, redirect, url_for, render_template
import json
import re
import requests
from urllib import unquote

db = None
col = None

app = Flask(__name__)


def getidlike(query):
    res = requests.get("http://dataing.pw/query?com=%s" % query)
    if res!="null":
        return json.loads(res.json())

def getbosslike(query):
    res = requests.get("http://dataing.pw/query?boss=%s" % query)
    if res!="null":
        return json.loads(res.json())

def to_node(d):
    return {"id": d["id"],
            "name": d["name"],
            "market": d["market"] }

@app.route("/")
def mainpage():
    print "main page"
    return render_template('index.html')

# --- search function ---
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
        results = getidlike(query)
        ids = results.keys()
    
        if len(ids) > 1:
            print "redirect to /company/id/%s" % ids[0]
            return redirect("company/id/%s" % ids[0])
        else:
            return "Company not found!"

    elif option == "boss":
        #results = getbosslike(query) 
        #ids = results.keys()
        
        #if len(ids) > 1:
        #    print "redirect to /company/id/%s" % ids[0]
        #    return redirect("company/id/%s" % ids[0])
        #else:
        #    return "Company not found!"
        return redirect("company/boss/%s" % query)


# --- for Cross-Origin Resources Sharing ---
@app.route("/getjson")
def getJson():
    
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
    q = u"公司編號 %s" % cid
    return render_template('graph.html', query=q, url=url)


@app.route("/company/boss/<boss>")
def show_company_byboss(boss):
    url = "http://dataing.pw/com?boss=%s" % boss
    q = u"董事長姓名 %s" % boss
    return render_template('graph.html', query=q, url=url)


if __name__ == "__main__":

    #col = init()

    app.debug = True
    print "========== app initialized =========="
    app.run()

