#!/usr/bin/env python
# -*- coding: utf-8 -*-

#from pymongo import MongoClient
from flask import Flask, request, redirect, url_for, render_template
from werkzeug.contrib.fixers import ProxyFix # for gunicorn
import json
import re
import requests
from urllib import unquote

db = None
col = None

app = Flask(__name__)
app.wsgi_app = ProxyFix(app.wsgi_app) # for gunicorn

def getidlike(query):
    res = requests.get("http://dataing.pw/query?com=%s" % query)
    if res!="null":
        return json.loads(res.json())

def getbosslike(query):
    res = requests.get("http://dataing.pw/query?boss=%s" % query)
    if res!="null":
        return json.loads(res.json())

def getbossfromid(query):
    res = requests.get("http://dataing.pw/query?board=%s" % query)
    if res!="null":
        return json.loads(res.json())		

def to_node(d):
    return {"id": d["id"],
            "name": d["name"],
            "market": d["market"] }

@app.route("/", methods=['GET', 'POST'])
def mainpage():
    print "main page"
    return render_template('index.html')



# --- search function ---
@app.route("/search", methods=['POST', 'GET'])
def search_companynet():
    print "in search"
    option = query = ''

    # get form arguments
    if request.method == 'POST':
        try:
            if request.form is not None:
                option = request.form.getlist('searchopt')[0]
                query = request.form.getlist('query')[0]
                graph = request.form.getlist('graphopt')[0]
            else:
                return "Error: form empty"
        except:
            return "Error: unable to get the form"
     
    elif request.method == 'GET':
        try:
            option = request.args['searchopt']
            query = request.args['query']
            graph = request.args['graphopt']
        except:
            return "Error: arguments miss"

    # search
    if option == "company":
        # search by company id
        if re.match("^[\d]{8}$", query)!=None:
            return redirect("%s/id/%s/%s" % (graph, query, query))

        # search by company name
        results = getidlike(query)

        if len(results) == 1:
            return redirect("%s/id/%s/%s" % (graph, results.keys()[0], results.values()[0] ) )
        print "graph=%s" % graph 
        
        return  render_template('company-list.html', method=request.method, graph=graph, query=query, targets=results, querytype='id')
        #return json.dumps({"content": tmpl})
        #ids = results.keys()
        #if len(ids) > 1:
        #    print "redirect to /company/id/%s" % ids[0]
        #    return redirect("company/id/%s" % ids[0])
        #else:
        #    return "Company not found!"

    elif option == "boss":
        results = getbosslike(query)
        print results


        return render_template('boss-list.html', method=request.method, graph=graph, query=query, targets=results, querytype='boss')
        
    else:
        return redirect("/")



# --- for Cross-Origin Resources Sharing (server-side access control) ---
@app.route("/getjson", methods=['GET'])
def getJson():
    print "in getjson" 
    if 'api' in request.args:
        url = request.args['api']
        print url
        print unquote(url)

        data = requests.get(unquote(url))
        if data.status_code != 200:
            return json.dumps({ "error" : "REST API error - %s" % data.status_code})
        else: 
            return data.json()
    else:
        return json.dumps({ "error" : "GET argument error - %s"})
#    G = get_network(cid, maxlvl=1)
#    if G:
#        return exp_company(G, "%s.cache" % cid)




# --- internal APIs ---
#default entry of company serach
@app.route("/company/id/<cid>/<name>", methods=['GET'])
def show_company_byid(cid, name):
    print 'company/id/%s' % cid
    maxlvl = '1'
    if 'maxlvl' in request.args:
        maxlvl = request.args['maxlvl']
    
    bossresults = getbossfromid(cid)
    bosslist = [];
    for boss in bossresults:
    	bosslist.append({"id": boss['id'], "name": boss['name']})
    return render_template('test.html', query_by="company", graph="company", cid=cid, name=name, bosslist=bosslist)


#default entry of boss serach
@app.route("/board/id/<bid>/<name>")
def show_boardnet_byid(bid, name):
    if 'maxlvl' in request.args:
        maxlvl = request.args['maxlvl']
    else:
        maxlvl = '1'
    bosslist = [{"id": 12, "name": "dummy"}]

    return render_template('test.html', query_by="boss", graph="company-by-boss", cid=bid, name=name, bosslist=bosslist)


    #bossinfo = getbosslike(query)
    #print bossinfo

    #return render_template('boss-graph.html', graph="board", query=q, url=url, graphinfo=info)

@app.route("/test")
def test_page():
	return render_template('test.html')
