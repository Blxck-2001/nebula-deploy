Maven Wrapper helper

Files added: `mvnw`, `mvnw.cmd`, `.mvn/wrapper/maven-wrapper.properties` and a PowerShell helper to download the wrapper JAR.

To install the wrapper JAR (Windows PowerShell):

```powershell
cd scripts
.
\download-maven-wrapper.ps1
```

Or run from repository root:

```powershell
.
backend-spring\scripts\download-maven-wrapper.ps1
```

After the script finishes, you can build without a global Maven installation:

Windows:
```
cd backend-spring
.\mvnw -DskipTests package
```

Unix/macOS:
```
cd backend-spring
./mvnw -DskipTests package
```
