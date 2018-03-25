// voltage datasets
  voltage = [[],[],[],[],[]];
  vplotdata = [[],[],[],[],[]];
// current datasets
  current = [[],[],[],[],[]];
  iplotdata = [[],[],[],[],[]];

//reflection and transmission coefficient
    ReflectionCoeff = [];
    TransmissionCoeff = [];

$(document).ready(function () {

  // var element = document.getElementsByTagName('form');
  $('#collectVariables').submit(function(event){
    event.preventDefault();
    for(var i=0; i<config.data.datasets.length;i++)
        config.data.datasets[i].data=[];
    window.myLine.update();
    voltage = [[],[],[],[],[]];
    current = [[],[],[],[],[]];
    vplotdata = [[],[],[],[],[]];
    iplotdata = [[],[],[],[],[]];
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
    cook['numberofcell']=$('#numberofcell').val();
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
    // propagation constant, p
    // attenuation constant, a
    // phase constant, b
    var b = sourceV.w * Math.sqrt(l * c);
    var a = (r * Math.sqrt( c / l) / 2) + (g * Math.sqrt( l / c) / 2);
    var p = math.complex(a,b);

    // characteristic impedance, Zo
    var Zo = math.sqrt(math.divide(math.complex(r,sourceV.w*l),math.complex(g,sourceV.w * c)));
    ReflectionCoeff.push(math.divide(math.subtract(Zo, Zs), math.add(Zo, Zs)));
    TransmissionCoeff.push(math.divide(math.multiply(2, Zo), math.add(Zo, Zs)));
    var const_a = calculateTanh(math.multiply(p, numberofcell));
    var Zin = math.multiply(Zo,math.divide(math.add(Zl, math.multiply(math.complex(0,1),Zo,const_a)),math.add(Zo, math.multiply(math.complex(0,1),Zl, const_a))));
    var TotalZ = math.add(Zs, Zin);
    createDataset(2*Math.PI/sourceV.w,numberofcell, sourceImp, TotalZ, sourceV);
  });
});
function createDataset(T,numofcell, sourceImp, TotalImp, sourceVparsed) {
    var scope = {"t":0*T};
    var readcookie = document.cookie;
    var cook = JSON.parse(readcookie.substring(5,readcookie.length));
    var srcvol = math.parse(cook['sourceV'], scope);
    var compilesrcvol = srcvol.compile();
    var srcvolvalues = [];
    srcvolvalues.push(compilesrcvol.eval(scope));
    for(var i=0.2;i<1;i=i+0.2){
      scope = {"t":i*T};
      srcvolvalues.push(compilesrcvol.eval(scope));
    };

    for(var i=0;i<5;i++){
        var V1 = math.multiply(TransmissionCoeff[0], math.subtract(srcvolvalues[i],math.multiply(sourceImp, math.divide(srcvolvalues[i], TotalImp))));
        var I1 = math.multiply(TransmissionCoeff[0], math.divide(srcvolvalues[i], TotalImp));
        voltage[i].push(V1);
        current[i].push(I1);
        vplotdata[i].push(V1.re);
        iplotdata[i].push(I1.re);
    }
    config.data.datasets[0].data.push({
                        x: 0,
                        y: vplotdata[0][0],
                    });
    window.myLine.update();
    var intervalcounter =1;
    var interval = setInterval(function () {
      console.log("Hello");
      intervalcounter++;
      if(intervalcounter === numofcell){
          clearinterval();
      }
      var r = math.eval(cook['resistance']);
      var l = math.eval(cook['inductance']);
      var c = math.eval(cook['capacitance']);
      var g = math.eval(cook['conductance']);
      var w = sourceVparsed.w;
      var Z1 = math.multiply(-1,math.complex(r,w*l));
      var Z2 = math.multiply(-1,math.complex(g,w*c));

      for(var i=0;i<5;i++){
          var Vn = voltage[i][voltage[i].length-1];
          var In = current[i][current[i].length-1];

          var Vn__plus_1 = math.add(Vn, math.multiply(In, Z1));
          var In__plus_1 = math.add(In, math.multiply(Vn, Z2));
          voltage[i].push(Vn__plus_1);
          current[i].push(In__plus_1);
          vplotdata[i].push(Vn__plus_1.re);
          iplotdata[i].push(In__plus_1.re);
      }

      config.data.datasets[0].data.push({
                        x: intervalcounter-1,
                        y: vplotdata[0][intervalcounter-1],
                    });
      window.myLine.update();
    },5000/numofcell);

    function clearinterval() {
        clearInterval(interval);
    }
  }
function calculateTanh(value) {
      var e_x = math.dotPow(Math.E, value);
      var e_minus_x = math.dotPow(Math.E, math.multiply(-1,value));
      var result = math.divide(math.add(e_x, math.multiply(-1,e_minus_x)), math.add(e_x,e_minus_x));
      return result;
  }