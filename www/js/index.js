/*jslint browser:true, devel:true */
/*global $:false */

// JSON con los barcos
var barcos = null;

// variable para almacenar el tablero de juego
// la matriz del tablero
var tablero = null;
var filas = 8;
var columnas = 8;

var segundos = 0;
var myTimer = null;
var disparos = 0;

var aciertos = 0;


/**
 * Esta función responde al evento "ready" y carga la 
 * configuración inicial de mi APP. Si no hay configuración,
 * cargamos una configuración por defecto.
*/
$(document).ready(function(){
    cargaConfiguracion();
});


function cargaConfiguracion(){
    //¿hay localStorage disponible? (almacenamos la conf. ahí)
    if (typeof(Storage) !== "undefined") {
        barcos = JSON.parse(localStorage.getItem("barcos"));
        
        if (barcos === null) {
            barcos = [
                {tam:2, letra:'f', nombre:'fragata'},
                {tam:3, letra:'b', nombre:'buque'},
                {tam:3, letra:'s', nombre:'submarino'},
                {tam:4, letra:'d', nombre:'destructor'},
                {tam:5, letra:'p', nombre:'portaaviones'},
            ];            
            localStorage.setItem("barcos",JSON.stringify(barcos));
        }
        
        filas = parseInt(localStorage.getItem("filas"));
        columnas = parseInt(localStorage.getItem("columnas"));
        
        if (isNaN(filas) || isNaN(columnas)) {
            filas = 8;
            columnas = 8;
            localStorage.setItem("filas",8);
            localStorage.setItem("columnas",8);
        }
        
        segundos = parseInt(localStorage.getItem("segundos"));
        if (isNaN(segundos)) {
            segundos = 30;
            localStorage.setItem("segundos",30);
        }
        
        disparos = parseInt(localStorage.getItem("disparos"));
        if (isNaN(disparos)) {
            disparos = 50;
            localStorage.setItem("disparos",50);
        }        
    } else { 
        // NO hay localStorage, no podemos guardar 
        // conf. ni información de las partidas (puntuaciones)
        console.log("No tenemos LocalStorage");
    }
}

/**
    Esta función crea una matriz (en JS es un 
    Array de Arrays)
*/
function crearMatriz (fil, col) {
    var matriz = new Array(fil);
    
    for(var i=0; i<fil; i++){
        matriz[i] = new Array(col);
        
    }
        
    return matriz;
}

/**
    Esta función crea una matriz RELLENA (en JS es un 
    Array de Arrays) CODIGO ÓPTIMO -AVANZADO-
*/
function crearMatrizRellena (fil, col,relleno) {
    var matriz = new Array(fil);
    
    for(var i=0; i<fil; i++){
        matriz[i] = new Array(col);
        for (var j=0; j<col; j++){
            matriz[i][j]=relleno;
        }
    }
        
    return matriz;
}


/** 
* Rellenamos con datos cada uno de los elementos
* de la matriz que se le pasa como paŕametro
*/

function inicializaMatriz(dato, matriz){
    for (var i = 0; i<matriz.length; i++){
        for(var j = 0; j<matriz[i].length; j++)
            matriz[i][j]=dato;
    }
}

/**
* Vuelca el contenido de la matriz a consola
*/

function matriz2console(matriz){
    var aux;
    
    for (var i=0;i<matriz.length;i++){
        aux="";
        for (var j=0; j<matriz[i].length;j++) {
            aux+=matriz[i][j]+'\t';
        }
        console.log(aux);
    }
            
}

/**
    Devuelve un numero aleatorio desde 0 hasta tamaño - 1.
    Será usado dos veces para el valor de la fila y de la columna
*/
function dado(tamanio){
    var aleatorio;
        aleatorio = Math.floor(Math.random() * (tamanio));        
    return aleatorio;
}

/**
    Devuelve 0 o 1 para horizontal o vertical
*/
function moneda(){    
    return dado(2);
}


/**
* Codificación para el tablero:
* a = agua
* s = submarino (3)
* f = fragata (2)
* p = portaaviones (5)
* d = destructor (4)
* b = buque (3)
*/
function colocarBarcos(matriz){
    //Compruebo que haya más de ocho filas y que la primera fila(igual a las demás) sean más de 8 columnas.
    var fila, col;
    for (var i=0; i<barcos.length;i++){
        var barco = barcos[i];
        var libre;
        do { 
            // intento colocar el barco hasta 
            // que encuentro espacio libre para él
            libre=true;
            var direccion = moneda();
            if (direccion===0) { // horizontal 
                fila = dado(matriz.length);
                col = dado(matriz[fila].length-barco.tam);
                for (j=0; j<barco.tam;j++){
                    if(matriz[fila][j+col]!='a') {
                        libre=false;
                    }
                }
                if (libre) {
                   for (j=0; j<barco.tam;j++){
                        matriz[fila][j+col]=barco.letra;
                   }
                }
            } else { // vertical
                fila = dado(matriz.length-barco.tam);
                col = dado(matriz[fila].length);
                for (j=0; j<barco.tam;j++){
                    if(matriz[j+fila][col]!='a') {
                        libre=false;
                    }
                }
                if (libre) {
                   for (var j=0; j<barco.tam;j++){
                        matriz[j+fila][col]=barco.letra;
                   }
                }
            }
        } while (!libre);
    }
    
}

function generarTablero(){
    var html='<table>';
    
    for (var i=0; i<filas;i++){
        html+='<tr>';
        for (var j=0; j<columnas;j++){
            html+='<td id="celda_'+i+'_'+j+'" class="vacio"+ onclick=disparo("celda_'+i+'_'+j+'",'+i+','+j+') > </td>';
            
        }
        html+='</tr>';
    }
    
    html+='</table>';
    document.getElementById("tablero").innerHTML=html;
}

function generarTablerojQ(){
    $("#tablero").empty(); // borro los descendientes de partida
    var tabla = $("<table />");
    for (var i=0; i<filas;i++) {
        var fila = $("<tr/>");
        for (var j=0; j<columnas;j++){
            var celda = $('<td id="celda_'+i+'_'+j+'"  onclick=disparo("celda_'+i+'_'+j+'",'+i+','+j+') > </td>');
            celda.addClass("vacio");
            fila.append(celda);
        }
        tabla.append(fila);
    }
    
    $("#tablero").append(tabla);
}
    
/**

*/
function crearPartida(){
    aciertos = 0;
    // PONEMOS LOS SEGUNDOS AL TIEMPO DE PARTIDA
    cargaConfiguracion();
    clearInterval(myTimer);
    // crear una matriz de fil x col
    tablero = crearMatriz(filas,columnas);
    // rellenar la matriz "a"
    inicializaMatriz('a',tablero);
    colocarBarcos(tablero);
    generarTablerojQ();
    // ARRANCAMOS EL TIMER!!! -> con setInterval()
    myTimer = setInterval(callbackTimer,1000);
    // ACTUALIZAMOS LAS CAJAS DEL TIEMPO Y DISPAROS
    $("#disparos").html(disparos+" misiles");
    $("#tiempo").html(segundos+" seg.");
    // volcar la matriz a consola
    matriz2console(tablero);
}

function callbackTimer(){
    // actualizar el tiempo que queda
    segundos--;
    // si el tiempo es <= 0 para el timer clearInterval() y acaba la partida
    if(segundos<=0) {
        terminarPartida(); // <- Ahora paro el interval en terminarPartida()
    }
    $("#tiempo").html(segundos+" seg.");
}

function disparo(celda,i,j){
    // alert("Has disparado en la caja: "+celda+ "hay que mirar el tablero en la posición"+i+","+j);
    if (disparos>0 && segundos>0) {
        disparos--;
        aciertos++;
        switch (tablero[i][j]){
            case 'a':
                tablero[i][j]='A';
                $('#'+celda).removeClass('vacio');
                $('#'+celda).addClass('agua');
                break;
            case 'b':
                tablero[i][j]='B';
                $('#'+celda).removeClass('vacio');
                $('#'+celda).addClass('buque');
                break;
            case 'd':
                tablero[i][j]='D';
                $('#'+celda).removeClass('vacio');
                $('#'+celda).addClass('destructor');
                break;
            case 'f':
                tablero[i][j]='F';
                $('#'+celda).removeClass('vacio');
                $('#'+celda).addClass('fragata');
                break;
            case 'p':
                tablero[i][j]='P';
                $('#'+celda).removeClass('vacio');
                $('#'+celda).addClass('portaaviones');
                break;
            case 's':
                tablero[i][j]='S';
                $('#'+celda).removeClass('vacio');
                $('#'+celda).addClass('submarino');
                break;
                            
            default:
                disparos++;
                aciertos--;
        }
        $("#disparos").html(disparos+" misiles");
    } else {
        // FINALIZAR PARTIDA Y PEDIR INFO PARA LOS MARCADORES (FORMULARIO)
        console.log("partida terminada.");
        terminarPartida();
    }
}


function terminarPartida(){
    // CALCULAR PUNTOS
    $("#puntos").val(aciertos*disparos*100+segundos*500);
    $("#segundos").val(segundos);
    // PARAR EL TIMER (porque no me queden disparos
    // o hayamos hundido todos los barcos)
    clearInterval(myTimer);
    
    // Mostrar el diálogo para guardar los puntos
    $.afui.clearHistory();
    $.afui.loadContent("#formulario",false,false,"up");
}

function guardarPuntos(){
    // Cargamos los marcadores de localStorage
    var marcadores = JSON.parse(localStorage.getItem("marcadores"));
    // Si no existe, lo inicializamos.
    if (marcadores === null) {
        marcadores = [];        
    }
    
    // Ejemplo de cómo leer de un formulario a JSON
    var puntuacion = {
        "nombre": $("#nombre").val(),
        "puntos": $("#puntos").val(),
        "tiempo": $("#segundos").val()
    };
    // Introducimos la puntuación en el array.
    marcadores.push(puntuacion);
    
    localStorage.setItem("marcadores",JSON.stringify(marcadores));
    
    mostrarPuntos();
}

function mostrarPuntos(){
    $("#puntuaciones").empty();
    // Cargamos los marcadores de localStorage
    var marcadores = JSON.parse(localStorage.getItem("marcadores"));
    // Si no existe, no hacemos nada.
    var tabla = $("<table border='1px solid black'/>");
    tabla.append("<tr><th>nombre</th><th>puntos</th><th>tiempo</th></tr>");
    if (marcadores !== null) {
        for (var jugador in marcadores) {
            var tr = $("<tr />");
            tr.append("<td>"+marcadores[jugador].nombre+"</td>");
            tr.append("<td>"+marcadores[jugador].puntos+"</td>");
            tr.append("<td>"+marcadores[jugador].tiempo+"</td>");
            tabla.append(tr);
        }
    }
    $("#puntuaciones").append(tabla);
    
    $.afui.clearHistory();
    $.afui.loadContent("#puntuaciones",false,false,"up");
}






