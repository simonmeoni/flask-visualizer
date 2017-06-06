import glob
import os

from flask import Flask, render_template, request, jsonify
import lxml.etree
app = Flask(__name__)
STATIC = 'static/xml/'
NS = {'xmlns': 'http://www.tei-c.org/ns/1.0'}


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
                text += "<data class=\"text__tagged_"+s_type+" tagged\" value=" + str(cpt) + ">" + w.text
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
    cpt = 1
    for s in doc.xpath('//xmlns:spanGrp[@type = \'' + s_type + '\']/xmlns:span',
                       namespaces=NS):
        list_t = []
        info[cpt] = "<p class=\"p information__p\"> lemma : <br/>" + s.get("lemma") + "</p>" + "<p class=\"p information__p\">" +\
                    " corresp : <br/>" + s.get("corresp") + "</p>"
        if s_type == "wordForms":
            info[cpt] += "<p class=\"p information__p\"> pos : <br/>" + s.get('pos') + "</p>"
        cpt += 1
        for t in s.get('target').split(" "):
            list_t.append(t[1:])
        target.append(list_t)
    return info


@app.route("/visualizer")
def parse_xml():
    return render_template('index.html')


if __name__ == "__main__":
    app.run(debug=True, host='0.0.0.0')
