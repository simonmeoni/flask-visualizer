$(document).ready(function() {
    var selected;
    var id;
    var json_id = {};

    $.ajax({
            url: $SCRIPT_ROOT + '/visualizer/initialize',
            type: 'GET',
            success: function(data) {
            console.log("success");
            },
            error: function (data) {
            debugger;
            alert("error");
            },
            complete: function(xhr, textStatus) {
            console.log("AJAX Request complete -> ", xhr, " -> ", textStatus);
            }
        }).done(
            function(data) {
            $.each(data.result['spangrp'], function(index,value){
                $('.annotations').append("<option value="+ value +">"+value+"</option>")
            })

            $.each(data.result['files'], function(index,value){
                $('.file').append("<option value="+ value +">"+value+"</option>")
            })
            createAnnotations()
        });


    $('.menu').on('change', function() {
        createAnnotations()
    });


    $(document).keydown(function(e){
        if (e.keyCode == 37) {
           prev();
        }

        if (e.keyCode == 39) {
           next();
        }
    });

    $(document).on('click','.tagged',function(){
        selected.removeClass("tagged_selected")
        selected = $(this)
        selected.addClass("tagged_selected")
        changeInfo()
    });

    $('.button_next').click(function(){ next(); });

    $('.button_prev').click(function(){ prev(); });


    function changeInfo(){
        selected.addClass("tagged_selected")
        id = selected.attr("value")
        $('.inflectedW').text(selected.html())
        $('.word').html(convertInfo())
    }

    function createAnnotations() {

        var data = {};
        data['type']  = $('.annotations').val();
        data['file'] = $('.file').val();

        return $.ajax({
            url: $SCRIPT_ROOT + '/visualizer/annotations',
            type: 'GET',
            data: data,
            success: function(data) {
            console.log("success");
            },
            error: function (data) {
            debugger;
            alert("error");
            },
            complete: function(xhr, textStatus) {
            console.log("AJAX Request complete -> ", xhr, " -> ", textStatus);
            }
        }).done(
         function(data) {
            json_id = data.result;
            $('.text').remove();
            $('.word').remove();
            $('.corpus').append("<p class=\"corpus_text text\">" + json_id["text"] + "</p>");
            $('.corpus').append("<div class=\"corpus_word word\"></div>");
            selected = $('.tagged').first();
            selected.addClass("tagged_selected");
            id = $('.tagged').first().attr('value');
            $('.word').append(convertInfo());
        });
    }

    function convertInfo(){
        cpt = 0
        t1 = "<tr>"
        t2 = "<tr>"
        t3 = "<tr>"
        info = "<h3 class=\"word_title title\">info</h3>"
        t1 += "<td class=\"word_inflectedW inflectedW\">" + selected.html() + "</td>"
        listT = [t2,t3,t1]
        info += "<table class=\"table\">"
        $.each(json_id['info'][id], function(index,value){
            listT[cpt] += "<td><strong>"+ index + ":</strong>  " + value + "</td>";
            cpt += 1
            if (cpt == 2){
                cpt = 0
            }
        });
        listT[0] +="</tr>"
        listT[1] +="</tr>"
        listT[2] +="</tr>"
        info +=  listT[2] + listT[1] + listT[0] + "</table>"
        console.log(info)
        return info;
    }

    function next(){
        selected.removeClass("tagged_selected")
        selected = $(".tagged[value = '" + id +"' ]").next()
        if(selected.html() == undefined){
            selected = $('.tagged').last()

        }
        changeInfo()
    }

    function prev(){
        selected.removeClass("tagged_selected")
        selected = $(".tagged[value = '" + id +"' ]").prev()
        if(selected.html() == undefined){
            selected = $('.tagged').first()
        }
        changeInfo()
    }
});

