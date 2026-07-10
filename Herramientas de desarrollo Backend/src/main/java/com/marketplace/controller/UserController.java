package com.marketplace.controller;

import com.marketplace.model.User;
import com.marketplace.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@CrossOrigin(origins = "http://localhost:4200")
@RestController
@RequestMapping("/users")
public class UserController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @GetMapping
    public List<User> getAll() {

        return userRepository.findAll();
    }

    @PostMapping
    public ResponseEntity<?> create(@RequestBody User user) {

        if (user.getNombre() == null ||
            user.getEmail() == null) {

            return ResponseEntity.badRequest().body("Datos inválidos");
        }

        if (user.getPassword() != null && !user.getPassword().startsWith("$2a$") && !user.getPassword().startsWith("$2b$") && !user.getPassword().startsWith("$2y$")) {
            user.setPassword(passwordEncoder.encode(user.getPassword()));
        }

        return ResponseEntity.ok(userRepository.save(user));
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getById(@PathVariable Long id) {

        return userRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> delete(@PathVariable Long id) {

        if (!userRepository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }

        userRepository.deleteById(id);

        return ResponseEntity.ok("Usuario eliminado");
    }
}