#!/bin/bash

EXEFILE="s_$(echo $FILENAME | sed 's/[^a-zA-Z0-9]//g')" # Name of executable file

cp $USERDIR/$FILENAME.$EXT $FILENAME.$EXT
logfile_jail "[#] Compiling as PASCAL"

logcode_jail "[#] [compile_pascal.sh]"
logcode_jail "[$] $tester_dir/run_judge_in_docker.sh "`pwd` "${languages_to_docker[$EXT]} pc -o$EXEFILE $FILENAME.$EXT >/dev/null 2>cerr"

$tester_dir/run_judge_in_docker.sh `pwd` ${languages_to_docker[$EXT]} pc -o$EXEFILE $FILENAME.$EXT >/dev/null 2>cerr
EXITCODE=$?
COMPILE_END_TIME=$(($(date +%s%N)/1000000));
logfile_jail "[#] Syntax checked. Execution Time: $((COMPILE_END_TIME-COMPILE_BEGIN_TIME)) ms"
# echo "Syntax checked. Exit Code=$EXITCODE  Execution Time: $((COMPILE_END_TIME-COMPILE_BEGIN_TIME)) ms\n"
if [ $EXITCODE -ne 0 ]; then
	logfile_jail "[#] Syntax Error:"
	logfile_jail "[#] $(cat cerr | head -10)"
	# echo '<span class="text-primary">Syntax Error</span>' >$RESULTFILE
	# echo '<span class="text-danger">' >> $RESULTFILE
	# (cat cerr | head -10 | sed 's/&/\&amp;/g' | sed 's/</\&lt;/g' | sed 's/>/\&gt;/g' | sed 's/"/\&quot;/g') >> $RESULTFILE
	# echo "</span>" >> $RESULTFILE
	cd ..
	rm -r $JAIL >/dev/null 2>/dev/null
	logfile_finish "Syntax Error"
fi

