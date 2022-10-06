#!/bin/bash

cp ../java.policy java.policy
cp $USERDIR/$FILENAME.java solution.java
logfile "Compiling as Java"

logfile "$tester_dir/run_judge_in_docker.sh "`pwd` " ${languages_to_docker[$EXT]} javac solution.java >/dev/null 2>cerr"
$tester_dir/run_judge_in_docker.sh `pwd` ${languages_to_docker[$EXT]} javac solution.java >/dev/null 2>cerr
# cp solution $FILENAME

EXITCODE=$?
COMPILE_END_TIME=$(($(date +%s%N)/1000000));
logfile "Compiled. Exit Code=$EXITCODE  Execution Time: $((COMPILE_END_TIME-COMPILE_BEGIN_TIME)) ms"
echo "Compiled. Exit Code=$EXITCODE  Execution Time: $((COMPILE_END_TIME-COMPILE_BEGIN_TIME)) ms\n"
if [ $EXITCODE -ne 0 ]; then
	logfile "Compile Error"
	logfile "$(cat cerr|head -10)"
	# echo '<span class="text-primary">Compile Error</span>' >$RESULTFILE
	# echo '<span class="text-danger">' >> $RESULTFILE
	# (cat cerr | head -10 | sed 's/&/\&amp;/g' | sed 's/</\&lt;/g' | sed 's/>/\&gt;/g' | sed 's/"/\&quot;/g') >> $RESULTFILE
	# echo "</span>" >> $RESULTFILE
	cd ..
	rm -r $JAIL >/dev/null 2>/dev/null
	logfile_finish "Compilation Error"
fi