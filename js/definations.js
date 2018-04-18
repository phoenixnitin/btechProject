// voltage datasets
  completeDatasetV = [];
// current datasets
  completeDatasetI = [];

//reflection and transmission coefficient
    ReflectionCoeff = [];
    TransmissionCoeff = [];

sleeptime=2000;

$(document).ready(function () {

  // var element = document.getElementsByTagName('form');
  $('#collectVariables').submit(function(event){
    event.preventDefault();
    for(var i=0; i<config.data.datasets.length;i++)
        config.data.datasets[i].data=[];
    window.myLine.update();
    completeDatasetV = [];
    completeDatasetI = [];
    ReflectionCoeff = [];
    TransmissionCoeff = [];
    var cook = {};
    cook['sourceV']=$('#ivoltage').val();
    cook['sourceImp']=$('#sourceImp').val();
    cook['loadImp']=$('#loadImp').val();
    cook['resistance']=$('#rvalue').val();
    cook['inductance']=$('#lvalue').val();
    cook['capacitance']=$('#cvalue').val();
    cook['conductance']=$('#gvalue').val();
    cook['nodevalue']=$('#nodevalue').val();
    cook['starting point']=$('#starting').val();
    cook['ending point']=$('#ending').val();
    cook['step']=$('#step').val();
    cook['numberofcell']=$('#numberofcell').val();
    cook['numberofreflection']=$('#numberofreflection').val();
    cook['unitcell']=document.querySelector('input[name="optradio"]:checked').value;
    console.log(cook, JSON.stringify(cook));
    document.cookie = "data="+JSON.stringify(cook)+";path:/;expires:";
    var sourceV = {"amp":"", "w":"", "f":"", "name":""};
    var sourceImp = math.complex(cook['sourceImp']);
    var loadImp = math.complex(cook['loadImp']);
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
    console.log(sourceV, sourceImp, loadImp);
    var r = math.eval($('#rvalue').val());
    var l = math.eval($('#lvalue').val());
    var c = math.eval($('#cvalue').val());
    var g = math.eval($('#gvalue').val());
    var Zl = math.complex($('#loadImp').val());
    var Zs = math.complex($('#sourceImp').val());
    var numberofcell = math.eval($('#numberofcell').val());
    var numberofreflection = math.eval($('#numberofreflection').val());
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
    createDataset(2*Math.PI/sourceV.w,numberofcell, sourceImp, TotalZ, sourceV);
    //plottimedependence(p, sourceImp,Zo,TotalZ,1/sourceV.f,sourceV.w);
  });
});
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

function clearplot(){
    for(var i=0; i<config.data.datasets.length;i++)
        config.data.datasets[i].data=[];
    window.myLine.update();
}

async function createDataset(T,numofcell, sourceImp, TotalImp, sourceVparsed) {
    var numberofdatasets=10;
    var readcookie = document.cookie;
    var cook = JSON.parse(readcookie.substring(5,readcookie.length));
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
        clearplot();
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
        // console.log(sumarray(datasetI[0]));
        for(var node=1;node<numberofnodes;node++){
            var Vn=datasetV[node-1][0];
            var In=datasetI[node-1][0];
            var Vn_plus_1 = math.subtract(Vn,math.multiply(Z1,In));
            var In_plus_1 = math.subtract(In,math.multiply(Z2,Vn));
            datasetV.push([Vn_plus_1]);
            datasetI.push([In_plus_1]);
            addvaluetoplot(node,Vn_plus_1.re,node,In_plus_1.re);
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
    var scope = {"t":0};
    var readcookie = document.cookie;
    var cook = JSON.parse(readcookie.substring(5,readcookie.length));
    var srcvol = math.parse(cook['sourceV'], scope);
    var nodevalue = math.eval(cook['nodevalue']);
    var start = math.eval(cook['starting point']);
    var stop = math.eval(cook['ending point']);
    var step = math.eval(cook['step']);
    var compilesrcvol = srcvol.compile();
    var Vs_at_t_0=compilesrcvol.eval(scope);
    var Is_at_t_0=math.divide(Vs_at_t_0,TotalZ);
    var V_0_0 = math.multiply(math.subtract(Vs_at_t_0, math.multiply(Is_at_t_0,sourceImp)),TransmissionCoeff[0]);
    var I_0_0 = math.multiply(Is_at_t_0, TransmissionCoeff[0]);
    var Vplus = math.divide(math.add(V_0_0,math.multiply(I_0_0,Z0)),2);
    var Vminus= math.divide(math.subtract(V_0_0,math.multiply(I_0_0,Z0)),2);
    var Iplus = math.divide(Vplus,Z0);
    var Iminus= math.divide(Vminus,Z0);
    var datasetV=[];
    var datasetI=[];
    var t=start;
    // config.options.scales.xAxes[0].scaleLabel.labelString="time (sec)";
    var mytimer=setInterval(function () {
        var v = math.add(math.multiply(Vplus,math.exp(math.multiply(-1,gamma,nodevalue-1)),math.exp(math.complex(0,w*t))),math.multiply(Vminus,math.exp(math.multiply(gamma,nodevalue-1)), math.exp(math.complex(0,w*t))));
        var i = math.subtract(math.multiply(Iplus,math.exp(math.multiply(-1,gamma,nodevalue-1)),math.exp(math.complex(0,w*t))),math.multiply(Iminus,math.exp(math.multiply(gamma,nodevalue-1)), math.exp(math.complex(0,w*t))));
        console.log("v:"+v.re,"i="+i.re);
        datasetV.push(v);
        datasetI.push(i);
        config.data.datasets[0].data.push({
            x: t,
            y: v.re
        });
        config.data.datasets[1].data.push({
            x: t,
            y: i.re
        });
        window.myLine.update();
        t+=step*T;
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