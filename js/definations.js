// voltage datasets
  completeDatasetV = [];
// current datasets
  completeDatasetI = [];

//reflection and transmission coefficient
    ReflectionCoeff = [];
    TransmissionCoeff = [];

sleeptime=100;

async function startnew(){
    for(var i=0; i<config.data.datasets.length;i++)
        config.data.datasets[i].data=[];
    await sleep(200);
    window.myLine.update();

    for(var i=0; i<configIm.data.datasets.length;i++)
        configIm.data.datasets[i].data=[];
    window.myLineIm.update();
    for(var i=0; i<config2.data.datasets.length;i++)
        config2.data.datasets[i].data=[];
    window.myLine2.update();

    for(var i=0; i<config2Im.data.datasets.length;i++)
        config2Im.data.datasets[i].data=[];
    // await sleep(200);
    window.myLine2Im.update();

    completeDatasetV = [];
    completeDatasetI = [];
    ReflectionCoeff = [];
    TransmissionCoeff = [];
    // sleeptime=1000/math.eval($('#numberofvaluestoplot').val());
    var readcookie = document.cookie.split(';')
    var cook = JSON.parse(readcookie[0].substring(5,readcookie[0].length));
    console.log(cook);
    var sourceV = {"amp":"", "w":"", "f":"", "name":""};
    var Volt = math.parse(cook['sourceV']);
    Volt.args.forEach(function(d, i){
      if("value" in d)
      {
          // console.log(d.value);
          sourceV.amp = d.value
      }
      else{
          if("value" in d.args[0].args[0])
              sourceV.w = d.args[0].args[0].value;
          else
              sourceV.w = d.args[0].args[1].value;
          if("name" in d.args[0].args[0])
              sourceV.name = d.args[0].args[0].name;
          else
              sourceV.name = d.args[0].args[1].name;
          // console.log(d.args[0].args[0].value, d.args[0].args[1].name);
      }
    });
    sourceV.f = sourceV.w/(2*Math.PI);
    console.log(sourceV);
    var r = math.eval(cook['resistance']);
    var l = math.eval(cook['inductance']);
    var c = math.eval(cook['capacitance']);
    var g = math.eval(cook['conductance']);
    var Zl = math.complex(cook['loadImp']);
    var Zs = math.complex(cook['sourceImp']);
    var numberofcell = math.eval(cook['numberofcell']);

    // propagation constant, p
    // attenuation constant, a
    // phase constant, b
    var b = sourceV.w * Math.sqrt(l * c);
    var a = (r * Math.sqrt( c / l) / 2) + (g * Math.sqrt( l / c) / 2);
    var p = math.complex(a,b);

    // characteristic impedance, Zo
    var Zo = math.sqrt(math.divide(math.complex(r,sourceV.w*l),math.complex(g,sourceV.w * c)));
    ReflectionCoeff.push(math.divide(math.subtract(Zo, Zs), math.add(Zo, Zs)));
    ReflectionCoeff.push(math.divide(math.subtract(Zl, Zo), math.add(Zl, Zo)));
    ReflectionCoeff.push(math.divide(math.subtract(Zs, Zo), math.add(Zs, Zo)));
    TransmissionCoeff.push(1);
    TransmissionCoeff.push(math.divide(math.multiply(2, Zl), math.add(Zl, Zo)));
    TransmissionCoeff.push(math.divide(math.multiply(2, Zs), math.add(Zs, Zo)));
    var const_a = calculateTanh(math.multiply(p, numberofcell+1));
    var Zin = math.multiply(Zo,math.divide(math.add(Zl, math.multiply(math.complex(0,1),Zo,const_a)),math.add(Zo, math.multiply(math.complex(0,1),Zl, const_a))));
    var TotalZ = math.add(Zs, Zin);
    // window.location.hash="canvas";
    if(cook['runningmode']=="distance"){
        filldata("distance",Zo);
        createDataset(2*Math.PI/sourceV.w,numberofcell, Zs, TotalZ, sourceV);
    }
    else if(cook['runningmode']=="time"){
        filldata("time",Zo);
        plottimedependence(p, Zs,Zo,TotalZ,1/sourceV.f,sourceV.w);
    }
    else if(cook['runningmode']=="both"){
        filldata("both",Zo);
        createDataset(2*Math.PI/sourceV.w,numberofcell, Zs, TotalZ, sourceV);
        plottimedependence(p, Zs,Zo,TotalZ,1/sourceV.f,sourceV.w);
    }
}

function filldata(runningtype, Z0){
    var readcookie = document.cookie.split(';');
    var cook = JSON.parse(readcookie[0].substring(5,readcookie[0].length));
    var datavalues=0;
    var valuearray=[];
    if(runningtype == 'distance'){
        valuearray = [0,1,2,3,4,5,6,7,8,9];
    }
    else if(runningtype == 'time'){
        valuearray = [0,1,2,3,4,5,6,9,10,11,12,13];
    }
    else{
        valuearray = [0,1,2,3,4,5,6,7,8,9,10,11,12,13];
    }
    $.each(valuearray, function (index, value) {
        var el = document.createElement('span');
        $(el).addClass('col-xs-12 col-md-6 col-lg-4');
        switch (value){
            case 0: $(el).html("Source Voltage(Vs): "+cook['sourceV']);break;
            case 1: $(el).html("Source Impedance(Zs): "+cook['sourceImp']);break;
            case 2: $(el).html("Load Impedance(Zl): "+cook['loadImp']);break;
            case 3: $(el).html("Resistance(ohm/cm): "+cook['resistance']);break;
            case 4: $(el).html("Inductance(Henry/cm): "+cook['inductance']);break;
            case 5: $(el).html("Capacitance(Farad/cm): "+cook['capacitance']);break;
            case 6: $(el).html("Conductance(mho/cm): "+cook['conductance']);break;
            case 7: $(el).html("Number of Unit Cell: "+cook['numberofcell']);break;
            case 8: $(el).html("Number of Reflection: "+cook['numberofreflection']);break;
            case 9: $(el).html("Characteristic Impedance(Z0): "+math.format(Z0,{"notation":"exponential", "precision":4}));break;
            case 10: $(el).html("Node Value: "+cook['nodevalue']);break;
            case 11: $(el).html("Starting Point: "+cook['starting point']);break;
            case 12: $(el).html("Ending Point: "+cook['ending point']);break;
            case 13: $(el).html("Steps (in sec): "+cook['step']);break;
            default: $(el).html("Something is wrong");
        }
        if(runningtype == "distance" || runningtype == 'both'){
            $('#data1').append(el);
        }
        else if(runningtype == "time"){
            $('#data3').append(el);
        }
    });
    if(runningtype == "distance"){
        $('#data2').html($('#data1').html());
    }
    else if(runningtype == "time"){
        $('#data4').html($('#data3').html());
    }
    else{
        $('#data2').html($('#data1').html());
        $('#data3').html($('#data1').html());
        $('#data4').html($('#data1').html());
    }

}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function sumarray(arr){
    var sum = 0;
    for(var i=0;i<arr.length;i++){
        sum += arr[i].re;
    }
    return sum;
}

function sumarrayIm(arr){
    var sum = 0;
    for(var i=0;i<arr.length;i++){
        sum += arr[i].im;
    }
    return sum;
}

function addvaluetoplot(x1,y1,x2,y2) {
    config.data.datasets[0].data.push({
                        x: x1,
                        y: y1,
                    });
    config.data.datasets[1].data.push({
                        x: x2,
                        y: y2,
                    });
    window.myLine.update();
}
function editvalueinplot(x1,y1,x2,y2){
    config.data.datasets[0].data[x1]['y']=y1;
    config.data.datasets[1].data[x2]['y']=y2;
    window.myLine.update();
}

function addvaluetoplotIm(x1,y1,x2,y2) {
    configIm.data.datasets[0].data.push({
                        x: x1,
                        y: y1,
                    });
    configIm.data.datasets[1].data.push({
                        x: x2,
                        y: y2,
                    });
    window.myLineIm.update();
}
function editvalueinplotIm(x1,y1,x2,y2){
    configIm.data.datasets[0].data[x1]['y']=y1;
    configIm.data.datasets[1].data[x2]['y']=y2;
    window.myLineIm.update();
}


function clearplot(){
    for(var i=0; i<config.data.datasets.length;i++)
        config.data.datasets[i].data=[];
    window.myLine.update();
}
function clearplotIm(){
    for(var i=0; i<configIm.data.datasets.length;i++)
        configIm.data.datasets[i].data=[];
    window.myLineIm.update();
}
function clearplot2(){
    for(var i=0; i<config2.data.datasets.length;i++)
        config2.data.datasets[i].data=[];
    window.myLine2.update();
}
function clearplot2Im(){
    for(var i=0; i<config2Im.data.datasets.length;i++)
        config2Im.data.datasets[i].data=[];
    window.myLine2Im.update();
}

async function createDataset(T,numofcell, sourceImp, TotalImp, sourceVparsed) {
    var numberofdatasets=10;
    var readcookie = document.cookie.split(';');
    var cook = JSON.parse(readcookie[0].substring(5,readcookie[0].length));
    var numberofnodes = math.eval(cook['numberofcell'])+1;
    var r = math.eval(cook['resistance']);
    var l = math.eval(cook['inductance']);
    var c = math.eval(cook['capacitance']);
    var g = math.eval(cook['conductance']);
    var numberofreflection = math.eval(cook['numberofreflection']);
    var w = sourceVparsed.w;
    var Z1 = math.complex(r,w*l);
    var Z2 = math.complex(g,w*c);
    for(var factor=0;factor<numberofdatasets;factor++){
        config.options.title.text="Transmission Line @ t = Time Period * "+factor/numberofdatasets;
        configIm.options.title.text="Transmission Line(Imaginary Part) @ t = Time Period * "+factor/numberofdatasets;
        window.myLine.update();
        window.myLineIm.update();
        clearplot();
        clearplotIm();
        var datasetV=[];
        var datasetI=[];
        // console.log(factor/numberofdatasets);
        var scope = {"t":factor*T/numberofdatasets};
        var srcvol = math.parse(cook['sourceV'], scope);
        var compilesrcvol = srcvol.compile();
        var Vs = compilesrcvol.eval(scope);
        var Is = math.divide(Vs,TotalImp);
        console.log(Vs, Is);
        datasetV.push([math.subtract(Vs,math.multiply(Is,sourceImp))]);
        datasetI.push([Is]);
        console.log("Node 0 (V):"+datasetV[0][0].re, "Node 0 (I):"+datasetI[0][0].re);
        addvaluetoplot(0,datasetV[0][0].re,0, datasetI[0][0].re);
        addvaluetoplotIm(0,datasetV[0][0].im,0, datasetI[0][0].im);
        // console.log(sumarray(datasetI[0]));
        for(var node=1;node<numberofnodes;node++){
            var Vn=datasetV[node-1][0];
            var In=datasetI[node-1][0];
            var Vn_plus_1 = math.subtract(Vn,math.multiply(Z1,In));
            var In_plus_1 = math.subtract(In,math.multiply(Z2,Vn));
            datasetV.push([Vn_plus_1]);
            datasetI.push([In_plus_1]);
            addvaluetoplot(node,Vn_plus_1.re,node,In_plus_1.re);
            addvaluetoplotIm(node,Vn_plus_1.im,node,In_plus_1.im);
            console.log("Node "+node+" (V):"+Vn_plus_1.re, "Node "+node+" (I):"+In_plus_1.re);
            await sleep(sleeptime);
            // console.log(sumarray(datasetI[node]));
        }
        for(var reflect=0;reflect<numberofreflection;reflect++){
            if((reflect%2)===0){
                for(var j=numberofnodes-1;j>=0;j--){
                    if(j==numberofnodes-1){
                        datasetV[j].push(math.multiply(ReflectionCoeff[1],datasetV[j][reflect]));
                        datasetI[j].push(math.multiply(ReflectionCoeff[1],datasetI[j][reflect]));
                    }
                    else{
                        datasetV[j].push(math.subtract(datasetV[j+1][reflect+1],math.multiply(Z1,datasetI[j+1][reflect+1])));
                        datasetI[j].push(math.subtract(datasetI[j+1][reflect+1],math.multiply(Z2,datasetV[j+1][reflect+1])));
                    }
                    editvalueinplot(j,sumarray(datasetV[j]),j,sumarray(datasetI[j]));
                    editvalueinplotIm(j,sumarrayIm(datasetV[j]),j,sumarrayIm(datasetI[j]));
                    console.log("Node "+j+" (V):"+datasetV[j][reflect+1].re, "Node "+j+" (I):"+datasetI[j][reflect+1]);
                    await sleep(sleeptime);
                }
            }
            else{
                for(var j=0;j<numberofnodes;j++){
                    if(j==0){
                        datasetV[j].push(math.multiply(ReflectionCoeff[2],datasetV[j][reflect]));
                        datasetI[j].push(math.multiply(ReflectionCoeff[2],datasetI[j][reflect]));
                    }
                    else{
                        datasetV[j].push(math.subtract(datasetV[j-1][reflect+1],math.multiply(Z1,datasetI[j-1][reflect+1])));
                        datasetI[j].push(math.subtract(datasetI[j-1][reflect+1],math.multiply(Z2,datasetV[j-1][reflect+1])));
                    }
                    editvalueinplot(j,sumarray(datasetV[j]),j,sumarray(datasetI[j]));
                    editvalueinplotIm(j,sumarrayIm(datasetV[j]),j,sumarrayIm(datasetI[j]));
                    console.log("Node "+j+" (V):"+datasetV[j][reflect+1].re, "Node "+j+" (I):"+datasetI[j][reflect+1]);
                    await sleep(sleeptime);
                }
            }
        }
        // console.log(datasetV, datasetI);
        completeDatasetV.push(datasetV);
        completeDatasetI.push(datasetI);
        await sleep(5000);
    }
  }
function plottimedependence(gamma, sourceImp, Z0, TotalZ ,T,w){
    var readcookie = document.cookie.split(';');
    var cook = JSON.parse(readcookie[0].substring(5,readcookie[0].length));
    var nodevalue = math.eval(cook['nodevalue']);
    var start = math.eval(cook['starting point']);
    var stop = math.eval(cook['ending point']);
    var step = math.eval(cook['step']);
    var V_and_t = JSON.parse(localStorage.getItem('V_and_t'));
    var Vs_at_t=V_and_t.Vs;
    var Is_at_t=math.divide(Vs_at_t,TotalZ);
    var V_0_t = math.multiply(math.subtract(Vs_at_t, math.multiply(Is_at_t,sourceImp)),TransmissionCoeff[0]);
    var I_0_t = math.multiply(Is_at_t, TransmissionCoeff[0]);
    var Vplus = math.divide(math.add(V_0_t,math.multiply(I_0_t,Z0)),math.multiply(2,math.exp(math.complex(0,w*V_and_t.time))));
    var Vminus= math.divide(math.subtract(V_0_t,math.multiply(I_0_t,Z0)),math.multiply(2,math.exp(math.complex(0,w*V_and_t.time))));
    var Iplus = math.divide(Vplus,Z0);
    var Iminus= math.divide(Vminus,Z0);

    var datasetV=[];
    var datasetI=[];
    var t=start;
    // config.options.scales.xAxes[0].scaleLabel.labelString="time (sec)";
    config2.options.title.text="Transmission Line @ Node:"+nodevalue;
    config2Im.options.title.text="Transmission Line(Imaginary Part) @ Node:"+nodevalue;
    var mytimer=setInterval(function () {
        var v = math.add(math.multiply(Vplus,math.exp(math.multiply(-1,gamma,nodevalue-1)),math.exp(math.complex(0,w*t))),math.multiply(Vminus,math.exp(math.multiply(gamma,nodevalue-1)), math.exp(math.complex(0,w*t))));
        var i = math.subtract(math.multiply(Iplus,math.exp(math.multiply(-1,gamma,nodevalue-1)),math.exp(math.complex(0,w*t))),math.multiply(Iminus,math.exp(math.multiply(gamma,nodevalue-1)), math.exp(math.complex(0,w*t))));
        console.log("v:"+v.re,"i="+i.re);
        datasetV.push(v);
        datasetI.push(i);
        config2.data.datasets[0].data.push({
            x: t,
            y: v.re
        });
        config2.data.datasets[1].data.push({
            x: t,
            y: i.re
        });
        window.myLine2.update();
        config2Im.data.datasets[0].data.push({
            x: t,
            y: v.im
        });
        config2Im.data.datasets[1].data.push({
            x: t,
            y: i.im
        });
        window.myLine2Im.update();


        t+=step;
        if(t>stop){
          clearInterval(mytimer);
        }
    },50);


}
function calculateTanh(value) {
      var e_x = math.dotPow(Math.E, value);
      var e_minus_x = math.dotPow(Math.E, math.multiply(-1,value));
      var result = math.divide(math.add(e_x, math.multiply(-1,e_minus_x)), math.add(e_x,e_minus_x));
      return result;
  }