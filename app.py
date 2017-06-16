import glob
import os
import json

import collections
from flask import Flask, render_template, request, jsonify
import lxml.etree
app = Flask(__name__)
STATIC = 'static/xml/'
NS = {'xmlns': 'http://www.tei-c.org/ns/1.0', 'ns': "http://standoff.proposal" }
lt_hash = {}
ph_hash = {}

with open("static/json/lexique-transdisciplinaire.json") as data_file:
    lt = json.load(data_file)
    for i in lt:
        lt_hash[i['formeId']] = i

with open("static/json/phraseo.json") as data_file:
    ph = json.load(data_file)
    for i in ph:
        ph_hash[int(i['phraseoEntryId'].split("_")[-1])] = i

@app.route('/visualizer/initialize')
def initialize():
    f_and_t = {'spangrp': []}
    files = glob.glob('static/xml/' + '*.xml')

    # get the different type of span
    doc = lxml.etree.parse(files[0])
    for t in doc.xpath('//ns:standOff', namespaces=NS):
        f_and_t['spangrp'].append(t.get('type'))

    # get files of the corpus
    f_and_t['files'] = [os.path.basename(x) for x in files]
    return jsonify(result=f_and_t)


@app.route("/visualizer/annotations")
def annotations():
    s_type = request.args.get('type', "", type=str)
    f = request.args.get('file', "", type=str)
    target = []
    json_res = {}
    doc = lxml.etree.parse(STATIC + f)
    # parse annotation
    json_res["info"] = parse_annotation(doc, s_type, target)
    # inject into text
    json_res["text"] = inject_annotations(doc, s_type, target)
    return jsonify(result=json_res)


def inject_annotations(doc, s_type, target):
    cpt = 1
    dict_t = collections.OrderedDict()
    text = ""
    for w in doc.xpath('//xmlns:text//xmlns:w', namespaces=NS):
        dict_t[w.xpath("@xml:id")[0]] = {"begin": "", "text": w.text, "end": ""}
    for t in target:
        dict_t[t[0]]["begin"] += "<data class=\"text_tagged_"+s_type+" tagged\" value=" + str(cpt) + ">"
        dict_t[t[-1]]["end"] += "</data>"
        if len(t) > 1 and dict_t[t[0]]["end"] != "":
            dict_t[t[0]]["end"] += "</data>"
            dict_t[t[-1]]["begin"] += "<data class =\"text_tagged_"+s_type+" tagged\" value=" + str(cpt) + ">"
            dict_t[t[-1]]["end"] += "</data>"
        cpt += 1
    for el in list(dict_t.items()):
        text += el[1]["begin"] + el[1]["text"] + el[1]["end"] + " "
    return text[0:-2]


def parse_annotation(doc, s_type, target):
    info = {}

    if s_type == "candidatsTermes":
        return parse_candidats_termes(doc, target, info)
    elif s_type == "wordForms":
        return parse_wordforms(doc, target, info)
    elif s_type == "syntagmesDefinis":
        return parse_syntagmes_definis(doc, target, info)
    elif s_type == "lexiquesTransdisciplinaires":
        return parse_lexiques_transdisciplinaire(doc, target, info)

    return 0


def parse_wordforms(doc, target, info):

    cpt = 1
    for s in doc.xpath('//ns:standOff[@type = \'wordForms\']//xmlns:span',
                       namespaces=NS):
        list_t = []
        info[cpt] = {'lemma': s.xpath(".//xmlns:string", namespaces=NS)[0].text, 'pos': s.xpath(".//xmlns:symbol", namespaces=NS)[0].get("value")}
        cpt += 1
        fill_target(list_t, s, target)

    return info


def parse_candidats_termes(doc, target, info):

    cpt = 1
    for s in doc.xpath('//ns:standOff[@type = \'candidatsTermes\']//xmlns:span',
                       namespaces=NS):
        list_t = []
        info[cpt] = {"lemma": s.xpath(".//xmlns:string", namespaces=NS)[0].text, "corresp": s.get("corresp")}
        cpt += 1
        fill_target(list_t, s, target)

    return info


def parse_lexiques_transdisciplinaire(doc, target, info):

    cpt = 1
    mem_target = ""
    for s in doc.xpath('//ns:standOff[@type = \'lexiquesTransdisciplinaires\']//xmlns:span',
                       namespaces=NS):
        list_t = []
        initial_form = ""
        info[cpt] = {}
        c = s.get("corresp")
        entry = lt_hash[int(c.split("-")[-1])]
        lst_id = 1
        libelle = s.xpath(".//xmlns:string", namespaces=NS)[0].text
        if cpt > 1 and mem_target == s.get("target") and info[cpt-1]["#lst" + str(lst_id)]["libelle"] == libelle:
            while "#lst" + str(lst_id) in info[cpt - 1]:
                lst_id += 1
            cpt -= 1
        mem_target = s.get("target")
        for fi in entry["words"]:
            initial_form += fi["formeInitiale"] + " "
        info[cpt]["#lst"+str(lst_id)] = {"libelle": libelle, "forme initiale": initial_form, "corresp": c,
                                         "cat. grammaticale": entry["categorie"], "classe sémantique": entry["classe"],
                     "sous-classe sémantique": entry["sous_classe"], "définition": entry["definition"]}
        cpt += 1
        fill_target(list_t, s, target)

    return info


def parse_syntagmes_definis(doc, target, info):
    cpt = 1
    mem_target = ""
    for s in doc.xpath('//ns:standOff[@type = \'syntagmesDefinis\']//xmlns:span',
               namespaces=NS):
        list_t = []
        info[cpt] = {}
        initial_form = ""
        c = s.get("corresp")
        entry = ph_hash[int(c.split("-")[-1])]
        lst_id = 1
        libelle = s.xpath(".//xmlns:string", namespaces=NS)[0].text
        if cpt > 1 and mem_target == s.get("target") and info[cpt - 1]["#phraseo" + str(lst_id)]["libelle"] == libelle:
            while "#phraseo" + str(lst_id) in info[cpt - 1]:
                lst_id += 1
            cpt -= 1
        for fi in entry["words"]:
            initial_form += fi["formeInitiale"] + " "
        info[cpt]["#phraseo" + str(lst_id)] = {"libelle": libelle, "forme initiale": initial_form, "corresp": c, "définition": entry["definition"]["text"]}
        mem_target = s.get("target")
        cpt += 1
        fill_target(list_t, s, target)

    return info


def fill_target(list_t, s, target):
    for t in s.get('target').split(" "):
        list_t.append(t[1:])
    if list_t not in target :
        target.append(list_t)


@app.route("/visualizer")
def parse_xml():
    return render_template('index.html')


if __name__ == "__main__":
    app.run(debug=True, host='0.0.0.0')
