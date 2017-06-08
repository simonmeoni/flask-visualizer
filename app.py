import glob
import os
import json

from flask import Flask, render_template, request, jsonify
import lxml.etree
app = Flask(__name__)
STATIC = 'static/xml/'
NS = {'xmlns': 'http://www.tei-c.org/ns/1.0'}

with open("static/json/lexique-transdisciplinaire.json") as data_file:
    lt = json.load(data_file)


@app.route('/visualizer/initialize')
def initialize():
    f_and_t = {'spangrp': []}
    files = glob.glob('static/xml/' + '*.xml')

    # get the different type of span
    doc = lxml.etree.parse(files[0])
    for t in doc.xpath('//xmlns:spanGrp', namespaces=NS):
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
    text = ""
    cpt = 1
    is_end = True

    for w in doc.xpath('//xmlns:text//xmlns:w', namespaces=NS):
        if target and w.xpath('@xml:id')[0] in target[0]:
            if is_end:
                text += "<data class=\"text_tagged_"+s_type+" tagged\" value=" + str(cpt) + ">" + w.text
            else:
                text += " " + w.text + " "
            target[0].pop(0)
            is_end = False
            if not target[0]:
                target.pop(0)
                text += "</data> "
                cpt += 1
                is_end = True
        else:
            text += w.text + " "
    return text


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
    for s in doc.xpath('//xmlns:spanGrp[@type = \'wordForms\']/xmlns:span',
                       namespaces=NS):
        list_t = []
        info[cpt] = {'lemma': s.get("lemma"), 'pos': s.get("pos")}
        cpt += 1
        fill_target(list_t, s, target)

    return info


def parse_candidats_termes(doc, target, info):

    cpt = 1
    for s in doc.xpath('//xmlns:spanGrp[@type = \'candidatsTermes\']/xmlns:span',
                       namespaces=NS):
        list_t = []
        info[cpt] = {"lemma": s.get("lemma"), "corresp": s.get("corresp")}
        cpt += 1
        fill_target(list_t, s, target)

    return info


def parse_lexiques_transdisciplinaire(doc, target, info):

    cpt = 1
    for s in doc.xpath('//xmlns:spanGrp[@type = \'lexiquesTransdisciplinaires\']/xmlns:span',
                       namespaces=NS):
        list_t = []
        info[cpt] = {"lemma": s.get("lemma"), "corresp": s.get("corresp")}
        cpt += 1
        fill_target(list_t, s, target)

    return info


def parse_syntagmes_definis(doc, target, info):

    cpt = 1
    for s in doc.xpath('//xmlns:spanGrp[@type = \'syntagmesDefinis\']/xmlns:span',
                       namespaces=NS):
        list_t = []
        info[cpt] = {"lemma": s.get("lemma"), "corresp": s.get("corresp")}
        cpt += 1
        fill_target(list_t, s, target)

    return info


def fill_target(list_t, s, target):
    for t in s.get('target').split(" "):
        list_t.append(t[1:])
    target.append(list_t)


@app.route("/visualizer")
def parse_xml():
    return render_template('index.html')


if __name__ == "__main__":
    app.run(debug=True, host='0.0.0.0')
