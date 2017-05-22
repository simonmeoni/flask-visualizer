$(document).ready(function() {
    var selected;
    var id;
    var json_id = {};

    $.getJSON($SCRIPT_ROOT + '/initialize',
        {},
        function(data) {
            $.each(data.result['spangrp'], function(index,value){
                $('.selector__menu--annotation').append("<option value="+ value +">"+value+"</option>")
            })

            $.each(data.result['files'], function(index,value){
                $('.selector__menu--file').append("<option value="+ value +">"+value+"</option>")
            })

            createAnnotations()

        });

    $('.menu').on('change', function() {
        createAnnotations()
    });

    $('.button--next').click(function(){
        selected.removeClass("tagged--selected")
        selected = $(".tagged[value = '" + id +"' ]").next()
        selected.addClass("tagged--selected")
        if(selected.html() == undefined){
            selected = $('.tagged').last()
        }
        changeInfo()
    });

    $('.button--prev').click(function(){
        selected.removeClass("tagged--selected")
        selected = $(".tagged[value = '" + id +"' ]").prev()
        selected.addClass("tagged--selected")
        if(selected.html() == undefined){
            selected = $('.tagged').first()
        }
        changeInfo()
    });


    function changeInfo(){
        id = selected.attr("value")
        $('.occurrence__text').text(selected.html())
        $('.occurrence__information').replaceWith("<div class=\"occurrence__information\">" + json_id["info"][id] + "</div>")
    }

    function createAnnotations() {
        $.getJSON($SCRIPT_ROOT + '/annotations',
        {
            type: $('.selector__menu--annotation').val(),
            file: $('.selector__menu--file').val(),
        },
        function(data) {
            json_id = data.result
            $('.text').remove()
            $('.occurrence').remove()
            $('.root-container').append("<p class=\"text\">" + json_id["text"] + "</p>")
            $('.root-container').append("<div class=\"occurrence\"></div>")
            selected = $('.tagged').first()
            selected.addClass("tagged--selected")
            id = $('.tagged').first().attr('value')
            $('.occurrence').append("<h2 class=\"title occurrence__title\">info : </h2>")
            $('.occurrence').append("<p class=\"text occurrence__text\">" + selected.html() + "</p>")
            $('.occurrence').append("<div class=\"information occurrence__information\">" + json_id["info"][id] + "</p>")
        })
    }
});

