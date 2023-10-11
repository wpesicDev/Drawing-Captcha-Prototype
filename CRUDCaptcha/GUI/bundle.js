(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
// import uuid from 'uuid';


function Continue() {
    // const id = uuid.v4();
    const componentName = document.querySelector("#Cname").value;
    const URL = document.querySelector("#URL").value;
    const Path = document.querySelector("#Path").value;

    if (componentName && URL && Path) {
        location.replace("http://localhost:5000/GUI/Capture/index.html");
    } else {
        alert("Properties could not be defined");
    }
}


},{}]},{},[1]);
