$(document).ready(function() {
    var selected;
    var id;
    var json_id = {};
    var type;
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

    $(document).on('click','.button_next',function(){ next(); });

    $(document).on('click','.button_prev',function(){ prev(); });


    function changeInfo(){
        selected.addClass("tagged_selected")
        id = selected.attr("value")
        $('.inflectedW').text(selected.html())
        $('.word').html(convertInfo(type))
    }



    $(document).on('click','.button_accordion',function(){

      panel = $(this).next();
      if (panel.hasClass("panel_inactive")){
        $(this).find(".panel_active").addClass("panel_inactive").removeClass("panel_active");
        panel.addClass("panel_active").removeClass("panel_inactive");
      }
      else {
        panel.addClass("panel_inactive").removeClass("panel_active");
      }
  });

    function createAnnotations() {

      var data = {};
      data['type']  = $('.annotations').val();
      data['file'] = $('.file').val();
      type = $('.annotations').val();
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
            $('.corpus').empty();
            $('.corpus').append("<div><p class=\"corpus_text text\">" + json_id["text"] + "</p><div class=\"root__buttons buttons\"><p class=\"buttons buttons__button button button_prev\">préc.</p><p class=\"buttons buttons__button button button_next\">suiv.</p></div></div>");
            $('.corpus').append("<div class=\"corpus_word word\"></div>");
            selected = $('.tagged').first();
            selected.addClass("tagged_selected");
            id = 1;
            $('.word').append(convertInfo(type));
        });
    }

      function convertInfo(type){
        cpt = 0;
        w = ""
        info = "<h3 class=\"word_title title\">info</h3>"
        info += "<p>"
        $(".tagged_selected").each(function(index){
            info += $(this).text() + " "
        });
        console.log(type)
        info += "</p>"
        if (type != "lexiquesTransdisciplinaires" && type != "syntagmesDefinis"){
            $.each(json_id['info'][id], function(index,value){
              info += "<button class=\"button_accordion\">" + index + "</button>"
              if (cpt > 2) {
                info += "<div class=\"panel_inactive\">"
              }
              else {
                info += "<div class=\"panel_active\">"
              }
              info += "<p>"+value+"</p>"
              info += "</div>"
            });
        }
        else {
          $.each(json_id["info"][id],function(index,value){
            info += "<button class=\"button_accordion button_accordion_lst\">" + index + "</button>"
            info += "<div class=\"panel_inactive\">"

            $.each(value, function(index2,value2){
              info += "<button class=\"button_accordion\">" + index2 + "</button>"
              if (cpt > 2) {
                info += "<div class=\"panel_inactive\">"
              }
              else {
                info += "<div class=\"panel_active\">"
              }
              info += "<p>"+value2+"</p>"
              info += "</div>"
            });
            info += "</div>"
          });
        }
        return info;
    }

    function next(){
        selected.removeClass("tagged_selected");
        id++;
        selected = $(".tagged[value = '" + id +"' ]");
        if(selected.html() == undefined){
            selected = $('.tagged').last();
        }
        changeInfo()
    }

    function prev(){
        selected.removeClass("tagged_selected")
        id--;
        selected = $(".tagged[value = '" + id +"' ]")
        if(selected.html() == undefined){
            selected = $('.tagged').first()
        }
        changeInfo()
    }
});
