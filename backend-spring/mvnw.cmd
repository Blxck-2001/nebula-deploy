@echo off
setlocal
set MVNWRAPPER_DIR=%~dp0
rem remove trailing backslash from MVNWRAPPER_DIR for -D value
set MAVEN_MULTI_DIR=%MVNWRAPPER_DIR:~0,-1%
java -Dmaven.multiModuleProjectDirectory="%MAVEN_MULTI_DIR%" -cp "%MAVEN_MULTI_DIR%\.mvn\wrapper\maven-wrapper.jar" org.apache.maven.wrapper.MavenWrapperMain %*
endlocal
