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
# 	No Test Cases



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
LOGFILENAME=${4}
# file name without extension
FILENAME=${5}
# file extension
EXT=${6}
# time limit in seconds
TIMELIMIT=${7}
# integer time limit in seconds (should be an integer greater than TIMELIMIT)
TIMELIMITINT=${8}
# memory limit in kB
MEMLIMIT=${9}
# output size limit in Bytes
OUTLIMIT=${10}
# diff tool (default: diff)
DIFFTOOL=${11}
# diff options (default: -bB)
DIFFOPTION=${12}
# enable/disable judge log
if [ ${13} -eq "1" ]; then
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

# Init log file path
LOGFILE_PROGRESS="$LOGFILE/test_$LOGFILENAME"
LOGFILE_RESULT="$LOGFILE/result_$LOGFILENAME"

# BELOW FUNC USE TO LOG PROCESS & RESULT RUN CODE.
# logfile (or logfile_jail): Use to log everything while compiling run, test code.
# logresult (or logresult_jail): Use to log result of test user's solution and solution's result.
function logfile
{
	if $LOG_ON; then
		echo -e "$@" >>$LOGFILE_PROGRESS
	fi
}
function logfile_jail
{
	if $LOG_ON; then
		echo -e "$@" >>"../$LOGFILE_PROGRESS"
	fi
}
function logresult
{
	echo -e "$@" >>$LOGFILE_RESULT
}
function logresult_jail
{
	echo -e "$@" >>"../$LOGFILE_RESULT"
}


function logfile_finish
{
	# Get Current Time (in milliseconds)
	END=$(($(date +%s%N)/1000000));
	logfile "\n[#] Total Execution Time: $((END-START)) ms"
	echo $@
	exit 0
}



#################### Initialization #####################

logfile "[%] INITIALIZATION"
logfile $@
# detecting existence of perl

logfile "[#] diff argu $DIFFOPTION"

PERL_EXISTS=true
hash perl 2>/dev/null || PERL_EXISTS=false
if ! $PERL_EXISTS; then
	logfile "[W] Warning: perl not found. We continue without perl..."
fi
JAIL=jail-$RANDOM
logfile "[$] mkdir $JAIL"
if ! mkdir $JAIL; then
	logfile "[#] Folder 'tester' is not writable! Exiting..."
	logfile_finish "Judge Error"
fi
logfile "[$] cd $JAIL"
cd $JAIL

logfile_jail "[#] $(date)"
logfile_jail "[#] Language: $EXT"
logfile_jail "[#] Time Limit: $TIMELIMIT (s) - Memory Limit: $MEMLIMIT (kB) - Output size limit: $OUTLIMIT (B)"

# In root source (sharif-judge), `C_SHIELD_ON`, `PY_SHIELD_ON`,... have values, 
# but in this source (`truongan forked`), those values were not defined
# => So I comment below code, because not necessary.
# if [[ $EXT = "c" || $EXT = "cpp" ]]; then
# 	logfile_jail "[#] C/C++ Shield: $C_SHIELD_ON"
# elif [[ $EXT = "py2" || $EXT = "py3" ]]; then
# 	logfile_jail "[#] Python Shield: $PY_SHIELD_ON"
# elif [[ $EXT = "java" ]]; then
# 	logfile_jail "[#] JAVA_POLICY: \"$JAVA_POLICY\""
# 	logfile_jail "[#] DISPLAY_JAVA_EXCEPTION_ON: $DISPLAY_JAVA_EXCEPTION_ON"
# fi

########################################################################################################
################################################ COMPILING #############################################
########################################################################################################

logfile_jail "[%] COMPILING"
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

if [ ! -d $PROBLEMPATH ] || [ ! -d "$PROBLEMPATH/in" ] || [ ! -d "$PROBLEMPATH/out" ]; then
	cd ..
	logresult "Problem path is invalid ('in' & 'out' dir was not exist)!";
	logfile_finish "No Test Cases";
fi

TST="$(ls $PROBLEMPATH/in/input*.txt | wc -l)"  # Number of Test Cases

logfile_jail "\n[%] TESTING - $TST test case(s) found"

if [ $TST -eq 0 ]; then
	cd ..
	logresult "No input files exist in '{PROBLEMPATH}/in' folder!";
	logfile_finish "No Test Cases";
fi

if [ -f "$PROBLEMPATH/tester.cpp" ] && [ ! -f "$PROBLEMPATH/tester.executable" ]; then
	logfile_jail "[#] Tester file found. Compiling tester..."
	TST_COMPILE_BEGIN_TIME=$(($(date +%s%N)/1000000));
	# An: 20160321 change
	# no optimization when compile tester code
	logfile_jail "[$] g++ -std=c++11 $PROBLEMPATH/tester.cpp -o $PROBLEMPATH/tester.executable 2>cerr"
	g++ -std=c++11 $PROBLEMPATH/tester.cpp -o $PROBLEMPATH/tester.executable 2>cerr
	EC=$?
	TST_COMPILE_END_TIME=$(($(date +%s%N)/1000000));
	if [ $EC -ne 0 ]; then
		logfile_jail "[#] Compiling tester failed."
		logfile_jail "[#] `cat cerr`"
		cd ..
		rm -r $JAIL >/dev/null 2>/dev/null
		logfile "[$] cd ..\n[$] rm -r $JAIL >/dev/null 2>/dev/null"
		logfile_finish "Invalid Tester Code"
	else
		logfile_jail "[#] Tester compiled. Execution Time: $((TST_COMPILE_END_TIME-TST_COMPILE_BEGIN_TIME)) ms"
	fi
fi

if [ -f "$PROBLEMPATH/tester.executable" ]; then
	logfile_jail "[#] Copying tester executable to current directory"
	logfile_jail "[$] cp $PROBLEMPATH/tester.executable code_tester"
	cp $PROBLEMPATH/tester.executable code_tester
	chmod +x code_tester
fi


PASSEDTESTS=0
###################################################################
######################## CODE RUNNING #############################
###################################################################

logfile_jail "\n[%] CODE RUNNING"
logfile_jail "[$] cp $PROBLEMPATH/in/input*.txt ./"
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
	logfile_jail "\n[#] === CASE $i/$TST ==="

	touch err
	logfile_jail "[$] touch err"

	# Copy file from original path to the jail.
	# Since we share jail with docker container, user may overwrite those file before hand
	cp $tester_dir/timeout ./timeout
	chmod +x timeout
	cp $tester_dir/runcode.sh ./runcode.sh
	chmod +x runcode.sh
	logfile_jail "[$] cp $tester_dir/timeout ./timeout"
	logfile_jail "[$] cp $tester_dir/runcode.sh ./runcode.sh"

	if [ ! ${languages_to_comm[$EXT]+_} ]; then
		logfile_jail "[r] File Format Not Supported"
		cd ..
		rm -r $JAIL >/dev/null 2>/dev/null
		logfile "[$] cd ..\n[$] rm -r $JAIL >/dev/null 2>/dev/null"
		logfile_finish "File Format Not Supported"
	fi
	command=${languages_to_comm[$EXT]}

	runcode=""
	if $PERL_EXISTS; then
		runcode="./runcode.sh $EXT $MEMLIMIT $TIMELIMIT $TIMELIMITINT ./input$i.txt ./timeout --just-kill -nosandbox -l $OUTLIMIT -t $TIMELIMIT -m $MEMLIMIT $command"
	else
		runcode="./runcode.sh $EXT $MEMLIMIT $TIMELIMIT $TIMELIMITINT ./input$i.txt $command"
	fi

	logfile_jail "[$] $tester_dir/run_judge_in_docker.sh `pwd` ${languages_to_docker[$EXT]} > run_judge_error $runcode 2>&1"
	
	$tester_dir/run_judge_in_docker.sh `pwd` ${languages_to_docker[$EXT]} > run_judge_error $runcode 2>&1
	EXITCODE=$?

	logfile_jail "[#] Run Judge Error:"
	logfile_jail "[#] `cat run_judge_error`"
	rm run_judge_error


	# logfile_jail "exit code $EXITCODE"
	##################################################################
	############## Process error code and error log ##################
	##################################################################

	if [ "$EXT" = "java" ]; then
		if grep -iq -m 1 "Too small initial heap" out || grep -q -m 1 "java.lang.OutOfMemoryError" err; then
			logfile_jail "[#] Memory Limit Exceeded java:"
			logfile_jail "[#] `cat out`"

			logresult_jail "TEST CASE $i: Memory limit Exceeded"
			continue
		fi
		if grep -q -m 1 "Exception in" err; then # show Exception
			javaexceptionname=`grep -m 1 "Exception in" err | grep -m 1 -oE 'java\.[a-zA-Z\.]*' | head -1 | head -c 80`
			javaexceptionplace=`grep -m 1 "$FILENAME.java" err | head -1 | head -c 80`
			logfile_jail "[#] Exception: $javaexceptionname\nMaybe at:$javaexceptionplace"
			# if DISPLAY_JAVA_EXCEPTION_ON is true and the exception is in the trusted list, we show the exception name
			if $DISPLAY_JAVA_EXCEPTION_ON && grep -q -m 1 "^$javaexceptionname\$" ../java_exceptions_list; then
				logfile_jail "[r] Runtime Error ($javaexceptionname)"
			else
				logfile_jail "[r] Runtime Error"
			fi
			logresult_jail "TEST CASE $i: Runtime Error (#314)"
			continue
		fi
	fi

	logfile_jail "[#] Exit Code = $EXITCODE"
	logfile_jail "[#] Error: `cat err`"

	t=`grep "EXCEPTION_" err|cut -d" " -f3`
	m=`grep "EXCEPTION_" err|cut -d" " -f5`
	m2=`grep "EXCEPTION_" err|cut -d" " -f7`
	m=$((m>m2?m:m2))
	logfile_jail "[#] Time-limit $t (s) - Memory-limit: $m (KiB)"
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

	t=`grep "FINISHED" err|cut -d" " -f3` # I search in Sharif-Judge source -> https://github.com/mjnaderi/Sharif-Judge/blob/Version-1/tester/tester.sh#L507
	logfile_jail "[#] Time-limit $t (s) - Memory-limit: $m (KiB)"
	if [ $found_error = "1" ]; then
		logfile_jail "[r] Found error"
		logresult_jail "TEST CASE $i: Found Error"
		continue
	fi

	if [ $EXITCODE -eq 137 ]; then
		logresult_jail "TEST CASE $i: Killed"
		logfile_jail "[r] Killed"
		continue
	fi

	if [ $EXITCODE -ne 0 ]; then
		logfile_jail "[r] Runtime Error"
		logresult_jail "TEST CASE $i: Runtime Error (#358)"
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
		logfile_jail "[$] ./code_tester $PROBLEMPATH/in/input$i.txt $PROBLEMPATH/out/output$i.txt out 2>cerr"
		./code_tester $PROBLEMPATH/in/input$i.txt $PROBLEMPATH/out/output$i.txt out 2>cerr
		EC=$?
		logfile_jail "[#] Code tester's result: $EC"
		logfile_jail "[#] Code tester's error: `cat cerr`"
		if [ $EC -eq 0 ]; then
			ACCEPTED=true
		fi
	else
		logfile_jail "[$] cp $PROBLEMPATH/out/output$i.txt correctout"
		cp $PROBLEMPATH/out/output$i.txt correctout
		if [ "$DIFFOPTION" = "ignore" ]; then
			# Removing all newlines and whitespaces before diff
			logfile_jail "[$] tr -d ' \t\n\r\f' <out >tmp1 && mv tmp1 out;\n[$] tr -d ' \t\n\r\f' <correctout >tmp1 && mv tmp1 correctout;"
			tr -d ' \t\n\r\f' <out >tmp1 && mv tmp1 out;
			tr -d ' \t\n\r\f' <correctout >tmp1 && mv tmp1 correctout;
		fi
		# Add a newline at the end of both files

		logfile_jail "[$] echo \"\" >> out\n[$] echo \"\" >> correctout"
		echo "" >> out
		echo "" >> correctout

		logfile_jail "[#] Compare out vs correctout: `diff out correctout | grep -e "^[0-9]" | head -n 5 `"

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
		logfile_jail "[r] ACCEPTED"
		logresult_jail "TEST CASE $i: PASSED"
		((PASSEDTESTS=PASSEDTESTS+1))
	else
		logfile_jail "[r] WRONG"
		logresult_jail "TEST CASE $i: FAILED"
	fi
done

logfile_jail "[R] Passed $PASSEDTESTS/$TST test cases."

# After I added the feature for showing java exception name and exception place,
# I found that the way I am doing it is a security risk. So I added the file "tester/java_exceptions_list"
# and now it is safe to show the exception name (if it is in file java_exceptions_list), but we should not
# show place of exception. So I commented following lines:
	## Print last java exception (if enabled)
	#if $DISPLAY_JAVA_EXCEPTION_ON && [ "$javaexceptionname" != "" ]; then
	#	echo -e "\n<span class=\"text-primary\">Last Java Exception:</span>" >>$RESULTFILE
	#	echo -e "$javaexceptionname\n$javaexceptionplace" >>$RESULTFILE
	#fi


logfile_jail "[#] [END]"

cd ..
# cp -r $JAIL "debug-jail-backup"
rm -r $JAIL >/dev/null 2>/dev/null # removing files
logfile "[$] cd ..\n[$] rm -r $JAIL >/dev/null 2>/dev/null"

((SCORE=PASSEDTESTS*10000/TST)) # give score from 10,000
logfile "\n[R] Score from 10000: $SCORE"
logresult "====================" # 20 "=" characters -> Separated test's result & output
logresult "$SCORE/10000"

logfile_finish $SCORE
