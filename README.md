# Online-Judge

## 1. Source structure
In this source code, I have 3 folders, for 3 purposes:
- **ui (`@judge-ui`)**: Frontend application, develop with ReactJS. Read more about ReactJS here: https://reactjs.org
- **api (`@judge-api`)**: Backend application for `@judge-ui`: Develop with NestJS. Read more about NestJS here: https://docs.nestjs.com/
- **sharif-judge (`@judge-wecode | @sharif-judge`)**: A new version of a fork of [Sharif-Judge](https://github.com/mjnaderi/Sharif-Judge) by [**@truongan**](https://github.com/truongan/wecode-judge).

## 2. Working flow

![](https://i.imgur.com/77CqQ2F.png)

Main app just includes 2 folders: `ui` & `api`. Folder `sharif-judge` use for running `coefficient_rule`, or for syncing data from old system to current system.
