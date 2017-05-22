$(document).ready(function() {
    var selected;
    var id;
    var json_id = {};

    $.getJSON($SCRIPT_ROOT + '/initialize',
        {},
        function(data) {
            $.each(data.result['spangrp'], function(index,value){
                $('.annotation').append("<option value="+ value +">"+value+"</option>")
            })

            $.each(data.result['files'], function(index,value){
                $('.file').append("<option value="+ value +">"+value+"</option>")
            })

            createAnnotations()

        });

    $('select').on('change', function() {
        createAnnotations()
    });

    $('.next').click(function(){
        selected = $("w[value = '" + id +"' ]").next()
        if(selected.html() == undefined){
            selected = $('w').last()
        }
        changeInfo()
    });

    $('.prev').click(function(){
        selected = $("w[value = '" + id +"' ]").prev()
        if(selected.html() == undefined){
            selected = $('w').first()
        }
        changeInfo()
    });


    function changeInfo(){
        id = selected.attr("value")

        $('.occ').replaceWith("<p class=\"occ\">" + selected.html() + "</p>")
        $('.description').replaceWith("<div class=\"description\">" + json_id["info"][id] + "</div>")
    }

    function createAnnotations() {
        $.getJSON($SCRIPT_ROOT + '/annotations',
        {
            type: $('.annotation').val(),
            file: $('.file').val(),
        },
        function(data) {
            json_id = data.result
            $('p.text').remove()
            $('div.controller').remove()
            $('body').append("<p class=\"text\">" + json_id["text"] + "</p>")
            $('w').css( "background-color", "rgb(255, 204, 229)")
            $('body').append("<div class=\"controller\"></div>")
            selected = $('w').first()
            id = $('w').first().attr('value')
            $('.controller').append("<p class=\"occ\">" + selected.html() + "</p>")
            $('.controller').append("<div class=\"description\">" + json_id["info"][id] + "</p>")
        })
    }
});

