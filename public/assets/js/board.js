window.onload = function() {
    $('.selectedColor').trigger('click');
}

let send;

$(function() {

    socket = io.connect('http://localhost:3000')

    socket.on('draw', (data)=>{
        if(data.source === 1){
            addExternalClick(data.mouseX, data.mouseY, false, data.color, data.width, data.delete)
        }else{
            addExternalClick(data.mouseX, data.mouseY, false, data.color, data.width. data.delete)
        }

        redraw();
        $('body').css('cursor', 'default');
    })

    socket.on('clear', (param)=>{
        clearCanvas();
    })

    c = document.getElementById('drawingPaper')
    context = c.getContext("2d");

    $('#drawingPaper').mousedown(function (e) {
        var mouseX = e.pageX - this.offsetLeft-110;
        var mouseY = e.pageY - this.offsetTop -100;
        paint = true;

        send = {
            mouseX,
            mouseY,
            source: 0,
            color: curColor,
            width: cursize,
            delete: curTool==="eraser" ? true : false
        }
        socket.emit('draw', send)
        addClick(mouseX, mouseY);
        redraw();
        $('body').css('cursor', 'default');
    });
    $('#drawingPaper').mousemove(function (e) {
        if (paint) {
            send = {
                mouseX: e.pageX - this.offsetLeft- 110,
                mouseY: e.pageY - this.offsetTop - 100,
                source : 1,
                color: curColor,
                width: cursize,
                delete: curTool==="eraser" ? true : false
            }
            socket.emit('draw', send)
            addClick(e.pageX - this.offsetLeft- 110, e.pageY - this.offsetTop-100, false);
            redraw();
            $('body').css('cursor', 'default');
        }
    });
    $('#drawingPaper').mouseup(function (e) {
        paint = false;
    });
    $('#drawingPaper').mouseleave(function (e) {
        paint = false;
    });
    var clickX = new Array();
    var clickY = new Array();
    var clickDrag = new Array();
    var paint;
    var curColor;


    $('.color li').click(function () {
        $(this).siblings('li').removeClass('selectedColor');
        $(this).addClass('selectedColor');
        curColor = $(this).children('span').attr('rel');

    });

    var cursize;
    $('.size li').click(function () {
        $(this).siblings('li').removeClass('selectedColor');
        $(this).addClass('selectedColor');
        cursize = $(this).children('span').attr('rel');
    });
    var clickSize = new Array();
    var clickColor = new Array();

    var curTool;
    $("#eraseCanvas").click(function () {
        curTool = "eraser";
    });

    $("#penCanvas").click(function () {
        curTool = "";
    });

    function addClick(x, y, dragging) {
        clickX.push(x);
        clickY.push(y);
        clickDrag.push(dragging);
        if (curTool == "eraser") {
            clickColor.push("white");
        } else {
            clickColor.push(curColor);
        }
        clickSize.push(cursize);
    }

    function addExternalClick(x, y, dragging, clr, siz, erase) {
        clickX.push(x);
        clickY.push(y);
        clickDrag.push(dragging);
        if (erase) {
            clickColor.push("white");
        } else {
            clickColor.push(clr);
        }
        clickSize.push(siz);
    }

    function redraw() {

        context.save();
        context.beginPath();
        context.rect(0, 0, context.canvas.width, context.canvas.height);
        context.clip();

        context.lineJoin = "round";

        for (var i = 0; i < clickX.length; i++) {
            context.beginPath();
            if (clickDrag[i] && i) {
                context.moveTo(clickX[i - 1], clickY[i - 1]);
            } else {
                context.moveTo(clickX[i] - 1, clickY[i]);
            }
            context.lineTo(clickX[i], clickY[i]);
            context.closePath();
            context.strokeStyle = clickColor[i];
            context.lineWidth = parseInt(clickSize[i]);
            context.stroke();
        }
        context.restore();
    }

    function clearCanvas(){
        context.clearRect(0, 0, c.width, c.height);
        clickX = []
        clickY = []
        clickColor = []
        clickSize = []
        clickDrag = []
    }


    $('#clrCanvas').click(function () {
        socket.emit('clear', 'clear')
        clearCanvas()
    });
});
