package com.media.tracker.controller;

import com.media.tracker.service.ImportService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.security.Principal;

@RestController
@RequestMapping("/api/v1/import")
public class ImportController {

    private final ImportService importService;

    public ImportController(ImportService importService) {
        this.importService = importService;
    }

    @PostMapping("/csv")
    public ResponseEntity<String> importCsv(
            @RequestParam("file") MultipartFile file,
            @RequestParam(value = "template", defaultValue = "custom") String template,
            Principal principal) {
        if (file.isEmpty()) {
            return ResponseEntity.badRequest().body("File is empty");
        }
        try {
            importService.importCsv(file, principal.getName(), template);
            return ResponseEntity.accepted().body("Import started in the background using " + template + " template.");
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("Error parsing CSV: " + e.getMessage());
        }
    }

    @GetMapping("/batches")
    public ResponseEntity<?> getBatches(Principal principal) {
        return ResponseEntity.ok(importService.getBatches(principal.getName()));
    }

    @DeleteMapping("/batches/{batchId}")
    public ResponseEntity<?> rollbackBatch(@PathVariable String batchId, Principal principal) {
        importService.rollbackBatch(batchId, principal.getName());
        return ResponseEntity.ok("Batch rolled back successfully.");
    }

    @GetMapping("/status")
    public ResponseEntity<ImportService.ImportProgress> getStatus(Principal principal) {
        return ResponseEntity.ok(importService.getProgress(principal.getName()));
    }
}
