# Solution Checking
This document was created to describe for 2 purposes:
- How to upload solution's test cases, which will be used to check user's solution.
- How it work!

## Upload your test cases
### Test case
Your folder should have a structure like below:
```bash
  |- folder_need_to_upload
      |- input1.txt
      |- input2.txt
      |- input3.txt
      |  ...
      |- inputN.txt
      |- output1.txt
      |- output2.txt
      |- output3.txt
      |  ...
      |- outputN.txt  # Expected output for input, which defined in file inputN.txt
      |
      |- template.cpp # (optional) If you need to config your template
```
for management reason on your computer, you can define those files in nested folder, like this:

```bash
  |- folder_need_to_upload
      |- in
      . |- input1.txt
      . |- input2.txt
      . |- input3.txt
      . |  ...
      . |- inputN.txt
      |- out
      . |- output1.txt
      . |- output2.txt
      . |- output3.txt
      . |  ...
      . |- outputN.txt  # Expected output for input, which defined in file inputN.txt
      |
      |- template.cpp # (optional) If you need to config your template
```

## How it work!