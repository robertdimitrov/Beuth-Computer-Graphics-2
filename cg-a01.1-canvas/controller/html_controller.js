/*
 * JavaScript / Canvas teaching framwork 
 * (C)opyright Hartmut Schirmacher, hschirmacher.beuth-hochschule.de
 * changes by Kristian Hildebrand, khildebrand@beuth-hochschule.de
 *
 * Module: html_controller
 *
 * Defines callback functions for communicating with various 
 * HTML elements on the page, e.g. buttons and parameter fields.
 *
 */


/* requireJS module definition */
define(["jquery", "Line", "Circle", "Point", "Rectangle", "KdTree", "util", "kdutil", "ParametricCurve", "BezierCurve"],
    (function($, Line, Circle, Point, Rectangle, KdTree, Util, KdUtil, ParametricCurve, BezierCurve) {
        "use strict";

        /*
         * define callback functions to react to changes in the HTML page
         * and provide them with a closure defining context and scene
         */
        var HtmlController = function(context,scene,sceneController) {

            //for KdTree functionality
            var kdTree;
            var pointList = [];

            // generate random X coordinate within the canvas
            var randomX = function() {
                return Math.floor(Math.random()*(context.canvas.width-10))+5;
            };

            // generate random Y coordinate within the canvas
            var randomY = function() {
                return Math.floor(Math.random()*(context.canvas.height-10))+5;
            };

            var randomRadius = function() {
                return Math.floor(Math.random()*(40))+15;
            };

            // generate random color in hex notation
            var randomColor = function() {

                // convert a byte (0...255) to a 2-digit hex string
                var toHex2 = function(byte) {
                    var s = byte.toString(16); // convert to hex string
                    if(s.length == 1) s = "0"+s; // pad with leading 0
                    return s;
                };

                var r = Math.floor(Math.random()*25.9)*10;
                var g = Math.floor(Math.random()*25.9)*10;
                var b = Math.floor(Math.random()*25.9)*10;

                // convert to hex notation
                return "#"+toHex2(r)+toHex2(g)+toHex2(b);
            };

            // public method: show parameters for selected object
            this.showParamsForObj = function(obj) {
                // hide all input elements before
                // visualizing the needed ones
                $(".formgroup").hide();

                if(!obj) { return; }

                // show elements that are common for all type of objects
                $("#formLine").show();
                $("#formColor").show();
                $("#formDelete").show();
                $("#inLineWidth").attr("value", obj.drawStyle.width);
                $("#inColor").attr("value", obj.drawStyle.color);

                // show elements needed by specific objects
                if(obj.radius != undefined){
                   $("#formRadius").show();
                    $("#inRadius").attr("value", obj.radius);
                }
                if(obj.segmentCount != undefined){
                    $("#formSegments").show();
                    $("#changeSegments").attr("value", obj.segmentCount);
                }
                if(obj.constructor == BezierCurve || obj.constructor == ParametricCurve){
                    $("#formTickmarks").show();
                    $("#tickmarks").attr("checked", obj.hasTickMarks);
                }
                if(obj.constructor == ParametricCurve){
                    $("#formTmin").show();
                    $("#formTmax").show();
                    $("#changeTmin").attr("value", obj.tmin);
                    $("#changeTmax").attr("value", obj.tmax);
                }

            };

            // for all elements of class objParams
            $(".objParam").change( (function(ev) {

                var obj = sceneController.getSelectedObject();
                if(!obj) {
                    window.console.log("ParamController: no object selected.");
                    return;
                };
                // change attributes of the selected object depending on its type
                obj.drawStyle.width = parseInt($("#inLineWidth").attr("value"));
                obj.drawStyle.color = $("#inColor").attr("value");
                if(obj.constructor!=Point && obj.constructor!=ParametricCurve) {
                    sceneController.selected[0].draggers[0].drawStyle.color = $("#inColor").attr("value");
                    sceneController.selected[0].draggers[1].drawStyle.color = $("#inColor").attr("value");
                    if(obj.constructor==BezierCurve){
                        sceneController.selected[0].draggers[2].drawStyle.color = $("#inColor").attr("value");
                        sceneController.selected[0].draggers[3].drawStyle.color = $("#inColor").attr("value");
                        sceneController.selected[0].polygon[0].drawStyle.color = $("#inColor").attr("value");
                    }
                }
                if(obj.radius != undefined) {
                    obj.radius = parseInt($("#inRadius").attr("value"));
                };
                if(obj.segmentCount != undefined){
                    obj.segmentCount = $("#changeSegments").val();
                }
                if(obj.constructor == ParametricCurve){
                    obj.tmin = parseInt($("#changeTmin").val());
                    obj.tmax = parseInt($("#changeTmax").val());
                }

                scene.draw(context);
            }));

            /*
             * callback for selection of an object
             */
            sceneController.onSelection(this.showParamsForObj);

            /*
             * callback for changing an object
             */
            sceneController.onObjChange(this.showParamsForObj);

            /*
             * event handler for "new Line" button
             */
            $("#btnNewLine").click( (function() {

                // create the actual line and add it to the scene
                var style = {
                    width: Math.floor(Math.random()*3)+1,
                    color: randomColor()
                };

                var line = new Line( [randomX(),randomY()],
                    [randomX(),randomY()],
                    style );
                scene.addObjects([line]);
                sceneController.deselect();
                sceneController.select(line); // this will also redraw

            }));

            /*
             * event handler for "new Circle" button
             */
            $("#btnNewCircle").click( (function() {

                // create the actual circle and add it to the scene
                var style = {
                    width: Math.floor(Math.random()*3)+1,
                    color: randomColor()
                };

                var circle = new Circle( [randomX(),randomY()],
                    randomRadius(),
                    style );
                scene.addObjects([circle]);

                // deselect all objects, then select the newly created object
                sceneController.deselect();
                sceneController.select(circle); // this will also redraw

            }));

            /*
             * event handler for "new Point" button
             */
            $("#btnNewPoint").click( (function() {

                // create the actual point and add it to the scene
                var style = {
                    width: Math.floor(Math.random()*3)+1,
                    color: randomColor(),
                    fill: true
                };

                var point = new Point( [randomX(),randomY()],
                    style );
                scene.addObjects([point]);

                // deselect all objects, then select the newly created object
                sceneController.deselect();
                sceneController.select(point); // this will also redraw

            }));

            /*
            * event handler for "new Square" button
             */
            $("#btnNewRect").click( (function() {

                // create the actual rectangle and add it to the scene
                var style = {
                    width: Math.floor(Math.random()*3)+1,
                    color: randomColor(),
                    fill: false
                };

                var rect = new Rectangle( [randomX(),randomY()], [randomX(),randomY()],
                    style );
                scene.addObjects([rect]);

                // deselect all objects, then select the newly created object
                sceneController.deselect();
                sceneController.select(rect); // this will also redraw

            }));

            /*
             * event handler for "delete object" button
             */
            $("#btnDeleteObject").click( (function(){
                var obj = sceneController.getSelectedObject();
                if(!obj){ return; }
                scene.removeObjects([obj]);
                sceneController.deselect(obj);
                // hide all interface input elements as deleting an object should not select another one
                $(".formgroup").hide();
            }));

            /*
             * event handler for "tick-marks" checkbox
             */
            $("#tickmarks").click((function(){
                var obj = sceneController.getSelectedObject();
                if(!obj){ return };
                var showMarks = $("#tickmarks").attr("checked");
                obj.hasTickMarks = showMarks;
            }));

            /*
             * event handler for "new PointList" button
             */
            $("#btnNewPointList").click( (function() {

                // create the actual line and add it to the scene
                var style = {
                    width: Math.floor(Math.random()*3)+1,
                    color: randomColor()
                };

                var numPoints = parseInt($("#inNumberPoints").attr("value"));
                $("#inColor").attr("value",style.color);
                for(var i=0; i<(numPoints || 10); ++i) {
                    var point = new Point([randomX(), randomY()],
                        style);
                    scene.addObjects([point]);
                    pointList.push(point);
                }

                // deselect all objects
                sceneController.deselect();

            }));


            /*
             * event handler for "visualize kd-Tree" checkbox
             */
            $("#visKdTree").click( (function() {
                var showTree = $("#visKdTree").attr("checked");
                if(showTree && kdTree) {
                    KdUtil.visualizeKdTree(sceneController, scene, kdTree.root, 0, 0, 600, true);
                    $("#visKdTree").attr("disabled", true);
                }

            }));

            /*
             * event handler for "build kd-Tree" button
             */
            $("#btnBuildKdTree").click( (function() {

                kdTree = new KdTree(pointList);

            }));

            /**
             * creates a random query point and
             * runs linear search and kd-nearest-neighbor search
             */
            $("#btnQueryKdTree").click( (function() {

                var style = {
                    width: 2,
                    color: "#ff0000"
                };
                var queryPoint = new Point([randomX(), randomY()],
                    style);
                scene.addObjects([queryPoint]);
                sceneController.select(queryPoint);

                console.log("query point: ", queryPoint.center);

                var linearTiming;
                var kdTiming;

                var tLBefore = Date.now();
                var minIdx = KdUtil.linearSearch(pointList, queryPoint);
                var tLAfter =  Date.now();
                linearTiming =tLAfter-tLBefore;

                console.log("nearest neighbor linear: ", pointList[minIdx].center);

                var tFNNBefore= Date.now();
                var kdNearestNeighbor = kdTree.findNearestNeighbor(kdTree.root, queryPoint, kdTree.root, 10000000, 0);
                var tFNNAfter = Date.now();
                kdTiming = tFNNAfter-tFNNBefore;

                console.log("nearest neighbor kd: ", kdNearestNeighbor.point.center);


                console.log("times  ",linearTiming,"   ",kdTiming);
                console.log("timesLin  ",tLBefore,"   ",tLAfter);
                console.log("timesRec  ",tFNNBefore,"   ",tFNNAfter);

                sceneController.select(pointList[minIdx]);
                sceneController.select(kdNearestNeighbor.point);
                $(".formgroup").hide();

            }));


            /*
             * event handler for "new Parametric Curve" button
             */
            $("#btnNewParametricCurve").click( (function() {
                var style = {
                    width: Math.floor(Math.random()*3)+1,
                    color: randomColor()
                };

                var f1 = $("#parCrvF1").val();
                var f2 = $("#parCrvF2").val();
                var tMin = $("#tMin").val();
                var tMax = $("#tMax").val();
                var segmentCount = $("#segmentCount").val();

                var paramCurve = new ParametricCurve(f1, f2, tMin, tMax, segmentCount, style
                );
                scene.addObjects([paramCurve]);

                // deselect all objects, then select the newly created object
                sceneController.deselect();
                sceneController.select(paramCurve); // this will also redraw

            }));

            /*
             * event handler for "new Beziere Curve" button
             */
            $("#btnNewBezierCurve").click( (function() {
                var style = {
                    width: Math.floor(Math.random()*3)+1,
                    color: randomColor()
                };

                var point0 = [$("#cp0x").val(), $("#cp0y").val()];
                var point1 = [$("#cp1x").val(), $("#cp1y").val()];
                var point2 =[$("#cp2x").val(), $("#cp2y").val()];
                var point3 =[$("#cp3x").val(), $("#cp3y").val()];
                var segmentCount_bezier = $("#segmentCount_bezier").val();

                var bezierCurve = new BezierCurve(point0,point1,point2,point3,segmentCount_bezier,style
                );
                scene.addObjects([bezierCurve]);

                // deselect all objects, then select the newly created object
                sceneController.deselect();
                sceneController.select(bezierCurve); // this will also redraw

            }));

        };

        // return the constructor function
        return HtmlController;


    })); // require



            