# Sync all data
This feature will move all of data from the old system to the new system (current).

| **For safety purpose, all of data in the current system will be removed! Read more in `Section 1.1`**

So, I think, just use this feature when you just initial this app. By the way, 
## Section 1: Which data will be update!
6 modules will be update! Includes: `Account`, `Language`, `Assignment`, `Problem`, `Assignment-Problems` & `Problem-Languages`.

### 1.1: Update accounts:
In the current system, account model has a special field (`is_root` (Like `root` user in ubuntu)).

When you run this feature, it will be remove all of accounts. Except root accounts (`is_root=true`).

### 1.2: Update assignment, problems, languages, assignment-problems & problem-languages:
Like **Update account** action, all of assignments, problems,... in this system will be removed; And will be replaced by data from the old system.

## How to sync:
Not simple by clicking button `Sync all data` in Settings page. You need do more than one step to sync :)

> **In this example, I will call:**  
> Old system is `@wecode`.  
> New system is `@judge-wecode` for `sharif-judge` folder; And `@judge` for `api` folder.

Of course, you need the SQL file, which was exported from your old system.

1. Start our `@judge-wecode` with your SQL file by following this guide: [Setup sharif-judge](https://github.com/nqhd3v/online-judge/tree/main/sharif-judge)
   - To check, go to `@wecode`'s adminer: http://localhost:12001.
   - Make sure that your data is ready before go to the next step.

2. Open our `@judge-api` and go to **Settings** page.
   - Go to section `Sync all-data` and click to the button "**Sync now**" to start.
   - Expected result:
     ![](https://i.imgur.com/UBryhMF.png)