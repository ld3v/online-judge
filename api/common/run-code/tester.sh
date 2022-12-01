#!/bin/bash

##################### Example Usage #####################
# tester.sh /home/nqhuy/judge/homeworks/hw6/p1 mjn problem problem c 1 1 50000 1000000 diff -bB 1 1 1 0 1 1
# In this example judge assumes that the file is located at:
# /home/nqhuy/judge/homeworks/hw6/p1/mjn/problem.c
# And test cases are located at:
# /home/nqhuy/judge/homeworks/hw6/p1/in/  {input1.txt, input2.txt, ...}
# /home/nqhuy/judge/homeworks/hw6/p1/out/ {output1.txt, output2.txt, ...}



####################### Output #######################
# Output is just one line. One of these:
#   a number (score form 10000)
#   Compilation Error
#   Syntax Error
#   Invalid Tester Code
#   File Format Not Supported
#   Judge Error



# Get Current Time (in milliseconds)
START=$(($(date +%s%N)/1000000));


# Tester directory
tester_dir="$(pwd)"
# problem directory
PROBLEMPATH=${1}
# username
USERDIR=${2}
# RESULTFILE=${3}
LOGFILE=${3}
# file name without extension
FILENAME=${4}
# file extension
EXT=${5}
# time limit in seconds
TIMELIMIT=${6}
# integer time limit in seconds (should be an integer greater than TIMELIMIT)
TIMELIMITINT=${7}
# memory limit in kB
MEMLIMIT=${8}
# output size limit in Bytes
OUTLIMIT=${9}
# diff tool (default: diff)
DIFFTOOL=${10}
# diff options (default: -bB)
DIFFOPTION=${11}
# enable/disable judge log
if [ ${12} = "1" ]; then
	LOG_ON=true
else
	LOG_ON=false
fi


DISPLAY_JAVA_EXCEPTION_ON=true

#$runcode
declare -A languages_to_docker
languages_to_docker["c"]="gcc:6"
languages_to_docker["cpp"]="gcc:6"
languages_to_docker["py2"]="python:2"
languages_to_docker["py3"]="python:3"
languages_to_docker["numpy"]="truongan/wecodejudge:numpy"
languages_to_docker["java"]="openjdk:8"
languages_to_docker["pas"]="nacyot/pascal-fp_compiler:apt"

# DIFFOPTION can also be "ignore" or "exact".
# ignore: In this case, before diff command, all newlines and whitespaces will be removed from both files
# identical: diff will compare files without ignoring anything. files must be identical to be accepted
DIFFARGUMENT=""
if [[ "$DIFFOPTION" != "identical" && "$DIFFOPTION" != "ignore" ]]; then
	DIFFARGUMENT=$DIFFOPTION
fi

function logfile
{
	if $LOG_ON; then
		echo -e "$@" >>$LOGFILE
	fi
}

function logfile_jail
{
	if $LOG_ON; then
		echo -e "$@" >>"../$LOGFILE"
	fi
}


function logfile_finish
{
	# Get Current Time (in milliseconds)
	END=$(($(date +%s%N)/1000000));
	logfile "\nTotal Execution Time: $((END-START)) ms"
	echo $@
	exit 0
}



#################### Initialization #####################

logfile "Running in '" . $tester_dir . "'"
logfile "Starting tester..."
logfile $@
# detecting existence of perl

logfile "diff argu $DIFFOPTION"

PERL_EXISTS=true
hash perl 2>/dev/null || PERL_EXISTS=false
if ! $PERL_EXISTS; then
	logfile "Warning: perl not found. We continue without perl..."
fi
JAIL=jail-$RANDOM
if ! mkdir $JAIL; then
	logfile "Error: Folder 'tester' is not writable! Exiting..."
	logfile_finish "Judge Error"
fi
cd $JAIL

logfile_jail "$(date)"
logfile_jail "Language: $EXT"
logfile_jail "Time Limit: $TIMELIMIT s"
logfile_jail "Memory Limit: $MEMLIMIT kB"
logfile_jail "Output size limit: $OUTLIMIT bytes"
if [[ $EXT = "c" || $EXT = "cpp" ]]; then
	logfile_jail "C/C++ Shield: $C_SHIELD_ON"
elif [[ $EXT = "py2" || $EXT = "py3" ]]; then
	logfile_jail "Python Shield: $PY_SHIELD_ON"
elif [[ $EXT = "java" ]]; then
	logfile_jail "JAVA_POLICY: \"$JAVA_POLICY\""
	logfile_jail "DISPLAY_JAVA_EXCEPTION_ON: $DISPLAY_JAVA_EXCEPTION_ON"
fi

########################################################################################################
################################################ COMPILING #############################################
########################################################################################################

COMPILE_BEGIN_TIME=$(($(date +%s%N)/1000000));

if [ "$EXT" = "java" ]; then
	source $tester_dir/compile_java.sh
elif [ "$EXT" = "py3"  ] || [ "$EXT" = "py2" ] || [ "$EXT" = "numpy" ]; then
	source $tester_dir/compile_python.sh
elif [ "$EXT" = "c" ] || [ "$EXT" = "cpp" ]; then
	source $tester_dir/compile_c.sh
elif [ "$EXT" = "pas" ]; then
	source $tester_dir/compile_pascal.sh
fi

########################################################################################################
################################################ TESTING ###############################################
########################################################################################################

TST="$(ls $PROBLEMPATH/in/input*.txt | wc -l)"  # Number of Test Cases

logfile_jail "\nTesting..."
logfile_jail "$TST test cases found"

if [ $TST -eq 0 ]; then
	logfile_finish "No test file found";
fi

if [ -f "$PROBLEMPATH/tester.cpp" ] && [ ! -f "$PROBLEMPATH/tester.executable" ]; then
	logfile_jail "Tester file found. Compiling tester..."
	TST_COMPILE_BEGIN_TIME=$(($(date +%s%N)/1000000));
	# An: 20160321 change
	# no optimization when compile tester code
	g++ -std=c++11 $PROBLEMPATH/tester.cpp -o $PROBLEMPATH/tester.executable 2>cerr
	EC=$?
	TST_COMPILE_END_TIME=$(($(date +%s%N)/1000000));
	if [ $EC -ne 0 ]; then
		logfile_jail "Compiling tester failed."
		logfile_jail `cat cerr`
		cd ..
		rm -r $JAIL >/dev/null 2>/dev/null
		logfile_finish "Invalid Tester Code"
	else
		logfile_jail "Tester compiled. Execution Time: $((TST_COMPILE_END_TIME-TST_COMPILE_BEGIN_TIME)) ms"
	fi
fi

if [ -f "$PROBLEMPATH/tester.executable" ]; then
	logfile_jail "Copying tester executable to current directory"
	cp $PROBLEMPATH/tester.executable code_tester
	chmod +x code_tester
fi


PASSEDTESTS=0
###################################################################
######################## CODE RUNNING #############################
###################################################################

cp $PROBLEMPATH/in/input*.txt ./

declare -A languages_to_comm
languages_to_comm["c"]="./$EXEFILE"
languages_to_comm["cpp"]="./$EXEFILE"
languages_to_comm["pas"]="./$EXEFILE"
languages_to_comm["py2"]="python2 -O $FILENAME.py2"
languages_to_comm["py3"]="python3 -O $FILENAME.py3"
languages_to_comm["numpy"]="python3 -O $FILENAME.numpy"
languages_to_comm["java"]="java -mx${MEMLIMIT}k solution"
declare -A errors
errors["EXCEPTION_TIME"]="Time Limit Exceeded"
errors["EXCEPTION_MEM"]="Memory Limit Exceeded"
errors["EXCEPTION_HANGUP"]="Process hanged up"
errors["EXCEPTION_SIGNAL"]="Killed by a signal"
errors["EXCEPTION_OUTSIZE"]="Output Size Limit Exceeded"

for((i=1;i<=TST;i++)); do
	logfile_jail "\n=== CASE $i/$TST ==="

	touch err

	# Copy file from original path to the jail.
	# Since we share jail with docker container, user may overwrite those file before hand
	cp $tester_dir/timeout ./timeout
	chmod +x timeout
	cp $tester_dir/runcode.sh ./runcode.sh
	chmod +x runcode.sh

	if [ ! ${languages_to_comm[$EXT]+_} ]; then
		logfile_jail "File Format Not Supported"
		cd ..
		rm -r $JAIL >/dev/null 2>/dev/null
		logfile_finish "File Format Not Supported"
	fi
	command=${languages_to_comm[$EXT]}

	runcode=""
	if $PERL_EXISTS; then
		runcode="./runcode.sh $EXT $MEMLIMIT $TIMELIMIT $TIMELIMITINT ./input$i.txt ./timeout --just-kill -nosandbox -l $OUTLIMIT -t $TIMELIMIT -m $MEMLIMIT $command"
	else
		runcode="./runcode.sh $EXT $MEMLIMIT $TIMELIMIT $TIMELIMITINT ./input$i.txt $command"
	fi

	logfile_jail "$ $tester_dir/run_judge_in_docker.sh "`pwd` "${languages_to_docker[$EXT]} $runcode"
	
	$tester_dir/run_judge_in_docker.sh `pwd` ${languages_to_docker[$EXT]} > run_judge_error $runcode 2>&1
	EXITCODE=$?

	logfile_jail `$ cat run_judge_error`
	rm run_judge_error


	# logfile_jail "exit code $EXITCODE"
##################################################################
############## Process error code and error log ##################
##################################################################

	if [ "$EXT" = "java" ]; then
		if grep -iq -m 1 "Too small initial heap" out || grep -q -m 1 "java.lang.OutOfMemoryError" err; then
			logfile_jail "Memory Limit Exceeded java"
			logfile_jail "$ cat out"
			continue
		fi
		if grep -q -m 1 "Exception in" err; then # show Exception
			javaexceptionname=`grep -m 1 "Exception in" err | grep -m 1 -oE 'java\.[a-zA-Z\.]*' | head -1 | head -c 80`
			javaexceptionplace=`grep -m 1 "$FILENAME.java" err | head -1 | head -c 80`
			logfile_jail "Exception: $javaexceptionname\nMaybe at:$javaexceptionplace"
			# if DISPLAY_JAVA_EXCEPTION_ON is true and the exception is in the trusted list, we show the exception name
			if $DISPLAY_JAVA_EXCEPTION_ON && grep -q -m 1 "^$javaexceptionname\$" ../java_exceptions_list; then
				logfile_jail "Runtime Error ($javaexceptionname)"
				echo "Runtime Error ($javaexceptionname).\n"
			else
				logfile_jail "Runtime Error"
				echo "Runtime Error.\n"
			fi
			continue
		fi
	fi

	logfile_jail "# Exit Code = $EXITCODE"
	logfile_jail "# Error: `cat err`"

	t=`grep "EXCEPTION_" err|cut -d" " -f3`
	m=`grep "EXCEPTION_" err|cut -d" " -f5`
	m2=`grep "EXCEPTION_" err|cut -d" " -f7`
	m=$((m>m2?m:m2))
	logfile_jail "# Time-limit $t (s) - Memory-limit: $m (KiB)"
	found_error=0

	if ! grep -q "FINISHED" err; then

		for K in "${!errors[@]}"
		do
			if grep -q "$K" err; then
				logfile_jail ${errors[$K]}
				found_error=1
				break
			fi
		done
			
	fi

	logfile_jail "# Time-limit $t (s) - Memory-limit: $m (KiB)"
	if [ $found_error = "1" ]; then
		continue
		logfile_jail "Found error"
	fi

	if [ $EXITCODE -eq 137 ]; then
		logfile_jail "Killed"
		continue
	fi

	if [ $EXITCODE -ne 0 ]; then
		logfile_jail "Runtime Error"
		continue
	fi
############################################################################
#################	# checking correctness of output #######################
############################################################################

	ACCEPTED=false
	if [ -f code_tester ]; then
		#Limit the amount of time tester run.
		#Perhaps 5 times longer than the solution timelimit is enough
		ulimit -t $(($TIMELIMITINT*5))
		./code_tester $PROBLEMPATH/in/input$i.txt $PROBLEMPATH/out/output$i.txt out 2>cerr
		EC=$?
		logfile_jail "# Code tester's result: $EC"
		logfile_jail `\# Code tester\'s error: cat cerr`
		if [ $EC -eq 0 ]; then
			ACCEPTED=true
		fi
	else
		cp $PROBLEMPATH/out/output$i.txt correctout
		if [ "$DIFFOPTION" = "ignore" ]; then
			# Removing all newlines and whitespaces before diff
			tr -d ' \t\n\r\f' <out >tmp1 && mv tmp1 out;
			tr -d ' \t\n\r\f' <correctout >tmp1 && mv tmp1 correctout;
		fi
		# Add a newline at the end of both files

		echo "" >> out
		echo "" >> correctout

		logfile_jail `diff out correctout | grep -e "^[0-9]" | head -n 5 `

		if [ "$DIFFTOOL" = "diff" ]; then
			# Add -q to diff options (for faster diff)
			DIFFTOOL="diff -q "
		fi
		# Compare output files
		if $DIFFTOOL $DIFFARGUMENT out correctout >/dev/null 2>/dev/null; then
			ACCEPTED=true
		fi
	fi

	if $ACCEPTED; then
		logfile_jail "ACCEPTED"
		((PASSEDTESTS=PASSEDTESTS+1))
	else
		logfile_jail "WRONG"
	fi
done


# After I added the feature for showing java exception name and exception place,
# I found that the way I am doing it is a security risk. So I added the file "tester/java_exceptions_list"
# and now it is safe to show the exception name (if it is in file java_exceptions_list), but we should not
# show place of exception. So I commented following lines:
	## Print last java exception (if enabled)
	#if $DISPLAY_JAVA_EXCEPTION_ON && [ "$javaexceptionname" != "" ]; then
	#	echo -e "\n<span class=\"text-primary\">Last Java Exception:</span>" >>$RESULTFILE
	#	echo -e "$javaexceptionname\n$javaexceptionplace" >>$RESULTFILE
	#fi



cd ..
# cp -r $JAIL "debug-jail-backup"
rm -r $JAIL >/dev/null 2>/dev/null # removing files


((SCORE=PASSEDTESTS*10000/TST)) # give score from 10,000
logfile "\nScore from 10000: $SCORE"

logfile_finish $SCORE
