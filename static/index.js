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

    $(document).on('click','.tagged',function(){
        selected.removeClass("tagged_selected")
        selected = $(this)
        selected.addClass("tagged_selected")
        changeInfo()
    });

    $('.button_next').click(function(){
        selected.removeClass("tagged_selected")
        selected = $(".tagged[value = '" + id +"' ]").next()
        if(selected.html() == undefined){
            selected = $('.tagged').last()

        }
        changeInfo()
    });

    $('.button_prev').click(function(){
        selected.removeClass("tagged_selected")
        selected = $(".tagged[value = '" + id +"' ]").prev()
        if(selected.html() == undefined){
            selected = $('.tagged').first()
        }
        changeInfo()
    });


    function changeInfo(){
        selected.addClass("tagged_selected")
        id = selected.attr("value")
        $('.inflectedW').text(selected.html())
        $('.info').html(json_id["info"][id])
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
            json_id = data.result
            $('.text').remove()
            $('.word').remove()
            $('.corpus').append("<p class=\"corpus_text text\">" + json_id["text"] + "</p>")
            $('.corpus').append("<div class=\"corpus_word word\"></div>")
            selected = $('.tagged').first()
            selected.addClass("tagged_selected")
            id = $('.tagged').first().attr('value')
            $('.word').append("<h3 class=\"word_title title\">info</h3>")
            $('.word').append("<p class=\"word_inflectedW inflectedW\">" + selected.html() + "</p>")
            $('.word').append("<div class=\"word_info info\">" + json_id["info"][id] + "</p>")
        });
    }
});

