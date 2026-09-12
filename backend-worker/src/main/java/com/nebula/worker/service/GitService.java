package com.nebula.worker.service;

import com.nebula.worker.model.Project;
import org.springframework.stereotype.Service;

import java.nio.file.Files;
import java.nio.file.Path;
import java.util.List;
import java.util.Map;

@Service
public class GitService {
    private final CommandRunner commandRunner;

    public GitService(CommandRunner commandRunner) {
        this.commandRunner = commandRunner;
    }

    /** Prepare repository in workDir/projectId. If exists, fetch/checkout/pull; otherwise clone.
     *  Supports optional commit checkout: if `commit` is provided it will checkout that SHA (doing an unshallow/fetch if needed).
     */
    public Path prepareRepository(Path baseDir, Project project, Map<String,String> extraEnv) throws Exception {
        return prepareRepository(baseDir, project, null, extraEnv);
    }

    public Path prepareRepository(Path baseDir, Project project, String commit, Map<String,String> extraEnv) throws Exception {
        Files.createDirectories(baseDir);
        Path repoDir = baseDir.resolve("project-" + project.getId().toString());
        String branch = project.getBranch() == null ? "main" : project.getBranch();
        if (Files.exists(repoDir.resolve(".git"))) {
            // existing repo: fetch all, then checkout commit or branch
            run(List.of("git","-C", repoDir.toString(), "fetch", "--all","--tags"), repoDir, extraEnv);
            if (commit != null && !commit.isBlank()) {
                // try to fetch specific commit if shallow
                run(List.of("git","-C", repoDir.toString(), "fetch", "origin", commit), repoDir, extraEnv);
                run(List.of("git","-C", repoDir.toString(), "checkout", commit), repoDir, extraEnv);
                run(List.of("git","-C", repoDir.toString(), "reset","--hard", commit), repoDir, extraEnv);
            } else {
                run(List.of("git","-C", repoDir.toString(), "checkout", branch), repoDir, extraEnv);
                run(List.of("git","-C", repoDir.toString(), "pull"), repoDir, extraEnv);
            }
        } else {
            // clone
            if (commit != null && !commit.isBlank()) {
                // clone full history so we can checkout arbitrary commit
                run(List.of("git","clone", project.getRepo(), repoDir.toString()), baseDir, extraEnv);
                run(List.of("git","-C", repoDir.toString(), "fetch","--all","--tags"), repoDir, extraEnv);
                run(List.of("git","-C", repoDir.toString(), "checkout", commit), repoDir, extraEnv);
                run(List.of("git","-C", repoDir.toString(), "reset","--hard", commit), repoDir, extraEnv);
            } else {
                run(List.of("git","clone","--depth","1","--branch", branch, project.getRepo(), repoDir.toString()), baseDir, extraEnv);
            }
        }
        return repoDir;
    }

    private void run(List<String> cmd, Path dir, Map<String,String> extraEnv) throws Exception {
        commandRunner.execute(cmd, dir, extraEnv, 120, line -> {});
    }
}
