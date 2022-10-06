#!/bin/bash
python="python"
if [ "$EXT" = "py2" ]; then
	python="python2"
fi
if [ "$EXT" = "py3" ]; then
	python="python3"
fi


cp $USERDIR/$FILENAME.$EXT $FILENAME.$EXT
logfile "Checking Python Syntax"
# logfile "$python -O -m py_compile $FILENAME.$EXT >/dev/null 2>cerr"

logfile "$tester_dir/run_judge_in_docker.sh "`pwd` "${languages_to_docker[$EXT]} $python -O -m py_compile $FILENAME.$EXT >/dev/null 2>cerr"
$tester_dir/run_judge_in_docker.sh `pwd` ${languages_to_docker[$EXT]} $python -O -m py_compile $FILENAME.$EXT >/dev/null 2>cerr
# $python -O -m py_compile $FILENAME.$EXT >/dev/null 2>cerr
EXITCODE=$?
COMPILE_END_TIME=$(($(date +%s%N)/1000000));
logfile "Syntax checked. Exit Code=$EXITCODE  Execution Time: $((COMPILE_END_TIME-COMPILE_BEGIN_TIME)) ms"
if [ $EXITCODE -ne 0 ]; then
	logfile "Syntax Error"
	logfile "$(cat cerr | head -10)"
	# echo '<span class="text-primary">Syntax Error</span>' >$RESULTFILE
	# echo '<span class="text-danger">' >> $RESULTFILE
	# (cat cerr | head -10 | sed 's/&/\&amp;/g' | sed 's/</\&lt;/g' | sed 's/>/\&gt;/g' | sed 's/"/\&quot;/g') >> $RESULTFILE
	# echo "</span>" >> $RESULTFILE
	cd ..
	rm -r $JAIL >/dev/null 2>/dev/null
	logfile_finish "Syntax Error"
fi

