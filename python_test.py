import math
import cmath

def sumarray(arr,data):
	mysum=0
	for num in arr:
		mysum+=num
	print("Total sum equals({}):{}".format(data, mysum))


f=50
factor=0.3
w=2*cmath.pi*f
t=2*cmath.pi/w
Vs=220*math.cos(w*factor*t)
print("w={}\tt={}\tVs={}".format(w, t, Vs))

Zs=complex(2,0)
Zl=complex(100,0)
R=0
L=0.5*10**-6
C=5*10**-12
G=0
print("R={}\nL={}\nC={}\nG={}".format(R,L,C,G))

numberofcell=5
numberofnodes=numberofcell+1
numberofreflection=2
print("Zs={}\tZl={}".format(Zs,Zl))

Z0=cmath.sqrt(complex(R,w*L)/complex(G,w*C));
print("Z0={}".format(Z0))

alpha=R*math.sqrt(C/L)/2+G*math.sqrt(L/C)/2
beta=w*math.sqrt(L*C)
gamma=complex(alpha,beta)
print("alpha={}\tbeta={}\tgamma={}".format(alpha,beta,gamma));

transmissionCoeff=[]
reflectionCoeff=[]
transmissionCoeff.append(2*Z0/(Zs+Z0))
transmissionCoeff.append(2*Zl/(Z0+Zl))
transmissionCoeff.append(2*Zs/(Z0+Zs))
reflectionCoeff.append((Z0-Zs)/(Z0+Zs))
reflectionCoeff.append((Zl-Z0)/(Zl+Z0))
reflectionCoeff.append((Zs-Z0)/(Zs+Z0))
print("transmissionCoeff={}\nreflectionCoeff={}".format(transmissionCoeff,reflectionCoeff))
print("tanh(gamma*x):{}".format(cmath.tanh(gamma*numberofcell)))
Zin=Z0*complex(Zl, Z0*cmath.tanh(gamma*numberofcell))/complex(Z0, Zl*cmath.tanh(gamma*numberofcell))
totalZ=Zs+Zin
print("Zin={}\ntotalZ={}".format(Zin,totalZ))

Is=Vs/totalZ
print("Is:{}".format(Is))
datasetV=[]
datasetI=[]

datasetV.append([transmissionCoeff[0]*(Vs-Is*Zs)])
sumarray(datasetV[0],"V")
datasetI.append([transmissionCoeff[0]*Is])
sumarray(datasetI[0],"I")

# print("datasetV={}\ndatasetI={}".format(datasetV,datasetI))

a=complex(R, w*L)
b=complex(G, w*C)
# print(a,b)
# print(a*datasetV[0][0], b*datasetI[0][0])
for i in range(1,numberofnodes):
	datasetV.append([datasetV[i-1][0]-a*datasetI[i-1][0]])
	sumarray(datasetV[i],"V")
	datasetI.append([datasetI[i-1][0]-b*datasetV[i-1][0]])
	sumarray(datasetI[i],"I")

# print("datasetV={}\ndatasetI={}".format(datasetV,datasetI))


for i in range(0,numberofreflection):
	if(i%2==0):
		for j in range(numberofnodes-1,-1,-1):
			if(j==numberofnodes-1):
				datasetV[j].append(reflectionCoeff[1]*datasetV[j][i])
				sumarray(datasetV[j],"Vref1")
				datasetI[j].append(reflectionCoeff[1]*datasetI[j][i])
				sumarray(datasetI[j],"Iref1")
			else:
				datasetV[j].append(datasetV[j+1][i+1]-a*datasetI[j+1][i+1])
				sumarray(datasetV[j],"Vref1")
				datasetI[j].append(datasetI[j+1][i+1]-b*datasetV[j+1][i+1])
				sumarray(datasetI[j],"Iref1")
	else:
		for j in range(0, numberofnodes):
			if(j==0):
				datasetV[j].append(reflectionCoeff[2]*datasetV[j][i])
				sumarray(datasetV[j],"Vref2")
				datasetI[j].append(reflectionCoeff[2]*datasetI[j][i])
				sumarray(datasetI[j],"Iref2")
			else:
				datasetV[j].append(datasetV[j-1][i+1]-a*datasetI[j-1][i+1])
				sumarray(datasetV[j],"Vref2")
				datasetI[j].append(datasetI[j-1][i+1]-b*datasetV[j-1][i+1])
				sumarray(datasetI[j],"Iref2")

for i in range(0,numberofreflection+1):
	if(i%2==0):
		for j in range(0,len(datasetV)):
			print("j:{}, i:{})   V:{}   \t I:{}".format(j,i,datasetV[j][i], datasetI[j][i]))
	else:
		for j in range(len(datasetV)-1,-1,-1):
			print("j:{}, i:{})   V:{}   \t I:{}".format(j,i,datasetV[j][i], datasetI[j][i]))



nodevalue=3
Vs_at_t_0 = 220*math.cos(w*t*0)
Is_at_t_0 = Vs_at_t_0/totalZ
V_0_0=transmissionCoeff[0]*(Vs_at_t_0-Is_at_t_0*Zs)
I_0_0=transmissionCoeff[0]*Is_at_t_0
Vplus=(V_0_0+I_0_0*Z0)/2
Vminus=(V_0_0-I_0_0*Z0)/2
Iplus=Vplus/Z0
Iminus=Vminus/Z0

print("Vs_at_t_0:{}\nIs_at_t_0:{}\nV_0_0:{}\nI_0_0:{}\ntotalZ:{}".format(Vs_at_t_0, Is_at_t_0, V_0_0, I_0_0, totalZ))
print("Vplus:{}\nVminus:{}\nIplus:{}\nIminus:{}".format(Vplus,Vminus,Iplus,Iminus))

datasetV2=[]
datasetI2=[]

def drange(start,stop,step):
	while start<stop:
		yield start
		start += step

for k in drange(0, 1*t, t/10):
	try:
		datasetV2.append(Vplus*cmath.exp(-gamma*(nodevalue-1))*cmath.exp(complex(0,w*k))+Vminus*cmath.exp(gamma*(nodevalue-1))*cmath.exp(complex(0,w*k)))
		datasetI2.append(Iplus*cmath.exp(-gamma*(nodevalue-1))*cmath.exp(complex(0,w*k))-Iminus*cmath.exp(gamma*(nodevalue-1))*cmath.exp(complex(0,w*k)))
	except OverflowError:
		datasetV2.append(float('inf'))
		datasetI2.append(float('inf'))

for i in range(0,len(datasetV2)):
	print("V:{}   \tI:{}".format(datasetV2[i],datasetI2[i]))
