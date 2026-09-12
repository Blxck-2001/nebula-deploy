package com.nebula.backend.controller;

import com.nebula.backend.model.User;
import com.nebula.backend.repo.UserRepository;
import com.nebula.backend.security.JwtUtil;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/auth")
public class AuthController {
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;

    public AuthController(UserRepository userRepository, PasswordEncoder passwordEncoder, JwtUtil jwtUtil) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtUtil = jwtUtil;
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody Map<String,String> body) {
        String email = body.get("email");
        String password = body.get("password");
        if (email == null || password == null) return ResponseEntity.badRequest().body(Map.of("error","email and password required"));
        if (userRepository.findByEmail(email).isPresent()) return ResponseEntity.status(409).body(Map.of("error","user exists"));
        User u = new User(); u.setEmail(email); u.setPassword(passwordEncoder.encode(password));
        userRepository.save(u);
        return ResponseEntity.ok(Map.of("message","user created"));
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String,String> body) {
        String email = body.get("email");
        String password = body.get("password");
        if (email == null || password == null) return ResponseEntity.badRequest().body(Map.of("error","email and password required"));
        var opt = userRepository.findByEmail(email);
        if (opt.isEmpty()) return ResponseEntity.status(401).body(Map.of("error","invalid credentials"));
        User u = opt.get();
        if (!passwordEncoder.matches(password, u.getPassword())) return ResponseEntity.status(401).body(Map.of("error","invalid credentials"));
        String token = jwtUtil.generateToken(u.getEmail());
        return ResponseEntity.ok(Map.of("accessToken", token));
    }
}
